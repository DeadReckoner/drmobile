import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  completeRoadmapCreationAction,
  selectAIRoadmapCreationState,
  selectAIRoadmapCreationStatus,
  setAiJobStatusAction,
  setCreationErrorAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * How often the job status is fetched while a roadmap is being generated.
 *
 * The WebSocket is only a fast path: production runs more than one API
 * machine and a job's progress is only broadcast to sockets connected to the
 * machine running it, so polling is what guarantees the app finds out.
 */
const POLL_INTERVAL_MS = 5000;

/**
 * Consecutive failed status requests before generation is reported as failed.
 * A single dropped request (tunnel, lift, phone waking up) must not surface an
 * error for a job that is still running on the server.
 */
const MAX_CONSECUTIVE_POLL_FAILURES = 3;

/**
 * AiRoadmapGenerationManager
 *
 * Headless tracker for AI roadmap generation: WebSocket (fast path) plus
 * status polling (source of truth). It renders nothing and must be mounted
 * for the whole signed-in session.
 *
 * This logic used to live inside InProgressAIRoadmapBanner, which is only
 * mounted once the Progress tab has been opened. A first-run user who goes
 * from onboarding straight to roadmap creation has never opened that tab, so
 * nothing tracked their job and the loading screen stayed at 0% forever.
 */
export const AiRoadmapGenerationManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAIRoadmapCreationStatus);
  const { t } = useLocalization();
  const wsRef = useRef<WebSocket | null>(null);
  // Bumped to make the socket effect open a fresh connection.
  const [reconnectNonce, setReconnectNonce] = useState(0);

  const { aiRoadmapCreationJobResponse } = useAppSelector(
    selectAIRoadmapCreationState,
  );
  const jobId = aiRoadmapCreationJobResponse?.job_id;
  const wsPath = aiRoadmapCreationJobResponse?.ws_url;
  const isActive = status === 'creating' && !!jobId;

  const { data: jobStatusData, refetch: refetchJobStatus } =
    useGetJobStatusQuery(
      { jobId: jobId || '' },
      {
        skip: !isActive,
        refetchOnFocus: true,
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true,
      },
    );

  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const completeWithRoadmap = useCallback(
    (roadmapId: string) => {
      const roadmap = {
        roadmap_id: roadmapId,
        goal: '',
        description: '',
        days: 0,
        completed: false,
        start_date: '',
        milestones: [],
        reason: '',
      };
      dispatch(setDraftRoadmapAction(roadmap));
      dispatch(completeRoadmapCreationAction(roadmap));
    },
    [dispatch],
  );

  // Status polling. The interval only runs while a job is active; a run of
  // failed requests is treated as a failed generation so the user gets the
  // Retry screen instead of an endless loader.
  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;
    let consecutiveFailures = 0;

    const interval = setInterval(async () => {
      let failed = false;
      try {
        const result = await refetchJobStatus();
        failed = result.isError;
      } catch {
        failed = true;
      }
      if (cancelled) return;

      consecutiveFailures = failed ? consecutiveFailures + 1 : 0;
      if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
        dispatch(setCreationErrorAction(t('common.something_went_wrong')));
        closeSocket();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isActive, refetchJobStatus, dispatch, t, closeSocket]);

  // Apply whatever the status endpoint reported.
  useEffect(() => {
    if (!isActive || !jobStatusData?.job_id) return;
    // A cached response for a previous job must not be applied to this one.
    if (jobStatusData.job_id !== jobId) return;

    dispatch(
      setAiJobStatusAction({
        type: 'status',
        message: 'job status update from polling',
        ...jobStatusData,
      }),
    );

    if (jobStatusData.status === 'failed') {
      dispatch(setCreationErrorAction(t('common.something_went_wrong')));
      closeSocket();
    } else if (jobStatusData.status === 'completed') {
      if (jobStatusData.result?.roadmap_id) {
        completeWithRoadmap(jobStatusData.result.roadmap_id);
      }
      closeSocket();
    } else if (
      (jobStatusData.status === 'processing' ||
        jobStatusData.status === 'pending') &&
      wsRef.current?.readyState !== WebSocket.OPEN &&
      wsRef.current?.readyState !== WebSocket.CONNECTING
    ) {
      // The job is still running and the socket is gone: open a new one.
      setReconnectNonce((nonce) => nonce + 1);
    }
  }, [
    isActive,
    jobId,
    jobStatusData,
    dispatch,
    t,
    closeSocket,
    completeWithRoadmap,
  ]);

  // WebSocket fast path.
  useEffect(() => {
    if (!isActive || !wsPath) return;

    closeSocket();

    const wsURL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/${wsPath}`;
    const ws = new WebSocket(wsURL, undefined, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string);
      dispatch(setAiJobStatusAction(message));

      if (message?.status === 'failed') {
        dispatch(setCreationErrorAction(t('common.something_went_wrong')));
      } else if (message?.status === 'completed') {
        const roadmapId =
          message?.data?.roadmap_id || message?.result?.roadmap_id;
        if (roadmapId) {
          completeWithRoadmap(roadmapId);
        }
      }
    };

    ws.onerror = () => {
      // Deliberately silent: polling decides the real status. This avoids
      // false errors when the phone is locked or the socket landed on a
      // machine that is not running the job.
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [
    isActive,
    wsPath,
    user.access_token,
    reconnectNonce,
    dispatch,
    t,
    closeSocket,
    completeWithRoadmap,
  ]);

  // Coming back to the foreground: the socket may be dead without knowing it.
  useEffect(() => {
    if (!isActive) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active') return;

      const result = await refetchJobStatus();
      if (
        result.data?.status === 'processing' ||
        result.data?.status === 'pending'
      ) {
        setReconnectNonce((nonce) => nonce + 1);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isActive, refetchJobStatus]);

  return null;
};
