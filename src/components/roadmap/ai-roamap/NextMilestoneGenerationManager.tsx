import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { MilestoneJobStatusFrameType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import {
  completeMilestoneGenerationAction,
  selectNextMilestoneGenerationState,
  setAdjustedRationaleAction,
  setMilestoneGenerationErrorAction,
  setMilestoneJobStatusAction,
} from '@/store/slices/nextMilestoneGenerationSlice';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Headless component — mounts in roadmap/_layout.tsx so it persists
 * across the entire roadmap navigation stack.
 *
 * Manages the WebSocket connection (primary) + RTK Query polling (fallback)
 * for next-milestone generation, mirroring InProgressAIRoadmapBanner.
 */
export const NextMilestoneGenerationManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { t } = useLocalization();
  const { status, jobResponse, roadmapId } = useAppSelector(
    selectNextMilestoneGenerationState,
  );

  const wsRef = useRef<WebSocket | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState(false);

  const isActive = status === 'generating';

  // ── Polling fallback ────────────────────────────────────────────────────────
  const { data: pollData, refetch: refetchJobStatus } = useGetJobStatusQuery(
    { jobId: jobResponse?.job_id || '' },
    {
      skip: !jobResponse?.job_id || !isActive,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!pollData?.job_id) return;

    dispatch(
      setMilestoneJobStatusAction({
        type: 'status',
        message: 'job status update from polling',
        job_id: pollData.job_id,
        progress: pollData.progress,
        status: pollData.status,
      }),
    );

    if (pollData.status === 'failed') {
      dispatch(
        setMilestoneGenerationErrorAction(t('common.something_went_wrong')),
      );
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } else if (pollData.status === 'completed') {
      if (roadmapId) {
        dispatch(
          roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
            forceRefetch: true,
          }),
        );
      }
      dispatch(completeMilestoneGenerationAction());
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } else if (
      pollData.status === 'processing' ||
      pollData.status === 'pending'
    ) {
      setShouldReconnect(true);
    }
  }, [pollData, dispatch, roadmapId, t]);

  // ── WebSocket (primary) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobResponse?.ws_url) return;
    if (!isActive) return;

    if (wsRef.current?.readyState === WebSocket.OPEN && !shouldReconnect) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsURL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/${jobResponse.ws_url}`;
    const ws = new WebSocket(wsURL, undefined, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });

    wsRef.current = ws;
    setShouldReconnect(false);

    ws.onmessage = (event) => {
      let frame: MilestoneJobStatusFrameType;
      try {
        frame = JSON.parse(event.data as string) as MilestoneJobStatusFrameType;
      } catch {
        return;
      }

      // Skip ping/pong frames
      if (frame.type === 'pong') return;

      dispatch(setMilestoneJobStatusAction(frame));

      // At 45% if AI adjusted the plan, surface the rationale
      if (
        frame.type === 'progress' &&
        frame.data?.adjusted === true &&
        frame.data.rationale
      ) {
        dispatch(setAdjustedRationaleAction(frame.data.rationale));
      }

      if (frame.status === 'failed') {
        dispatch(
          setMilestoneGenerationErrorAction(t('common.something_went_wrong')),
        );
      } else if (frame.type === 'complete' || frame.status === 'completed') {
        if (roadmapId) {
          dispatch(
            roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
              forceRefetch: true,
            }),
          );
        }
        dispatch(completeMilestoneGenerationAction());
      }
    };

    ws.onerror = () => {
      // Don't immediately error — let polling determine the real status
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [
    jobResponse?.ws_url,
    user.access_token,
    isActive,
    shouldReconnect,
    roadmapId,
    dispatch,
    t,
  ]);

  // ── AppState — reconnect WebSocket when app comes to foreground ────────────
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isActive) {
        const result = await refetchJobStatus();
        if (
          result.data?.status === 'processing' ||
          result.data?.status === 'pending'
        ) {
          setShouldReconnect(true);
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [isActive, refetchJobStatus]);

  return null;
};
