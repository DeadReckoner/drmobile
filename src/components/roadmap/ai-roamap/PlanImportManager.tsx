import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { ImportNotesType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import {
  completeImportAction,
  selectPlanImportJobResponse,
  selectPlanImportStatus,
  setImportErrorAction,
  setJobStatusAction,
} from '@/store/slices/planImportSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const PlanImportManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { t } = useLocalization();
  const status = useAppSelector(selectPlanImportStatus);
  const jobResponse = useAppSelector(selectPlanImportJobResponse);

  const wsRef = useRef<WebSocket | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState(false);

  const isActive = status === 'processing';

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
      setJobStatusAction({
        type: 'status',
        message: 'job status update from polling',
        job_id: pollData.job_id,
        progress: pollData.progress,
        status: pollData.status,
      }),
    );

    if (pollData.status === 'failed') {
      dispatch(setImportErrorAction(t('common.something_went_wrong')));
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } else if (pollData.status === 'completed') {
      if (pollData.result?.roadmap_id) {
        const roadmap = {
          roadmap_id: pollData.result.roadmap_id,
          goal: '',
          description: '',
          days: 0,
          completed: false,
          start_date: '',
          milestones: [],
          reason: '',
        };
        dispatch(setDraftRoadmapAction(roadmap));
        dispatch(completeImportAction({ roadmap, importNotes: null }));
        dispatch(
          roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
            forceRefetch: true,
          }),
        );
      }
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
  }, [pollData, dispatch, t]);

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
      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(event.data as string);
      } catch {
        return;
      }

      if (frame.type === 'pong') return;

      dispatch(
        setJobStatusAction({
          type: 'status',
          job_id: (frame.job_id as string) || '',
          progress: (frame.progress as number) || 0,
          status: (frame.status as string) || '',
          message: (frame.message as string) || '',
        }),
      );

      if (frame.status === 'failed') {
        const errorMessage =
          (frame.message as string) || t('common.something_went_wrong');
        dispatch(setImportErrorAction(errorMessage));
      } else if (frame.status === 'completed') {
        const data = frame.data as Record<string, unknown> | undefined;
        const result = frame.result as Record<string, unknown> | undefined;
        const roadmapId =
          (data?.roadmap_id as string) || (result?.roadmap_id as string);

        if (roadmapId) {
          const importNotes = (data?.import_notes as ImportNotesType) || null;
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
          dispatch(completeImportAction({ roadmap, importNotes }));
          dispatch(
            roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
              forceRefetch: true,
            }),
          );
        }
      }
    };

    ws.onerror = () => {};

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
    dispatch,
    t,
  ]);

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
