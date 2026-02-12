import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  completeRoadmapCreationAction,
  resetCreationStateAction,
  selectAIRoadmapCreationState,
  selectAIRoadmapCreationStatus,
  selectCreatedRoadmap,
  selectIsAIRoadmapInDraft,
  setAiJobStatusAction,
  setCreationErrorAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const InProgressAIRoadmapBanner = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAIRoadmapCreationStatus);
  const createdRoadmap = useAppSelector(selectCreatedRoadmap);
  const isInDraft = useAppSelector(selectIsAIRoadmapInDraft);
  const { t } = useLocalization();
  const isCompleted = status === 'completed';
  const wsRef = useRef<WebSocket | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState(false);

  const { aiRoadmapCreationJobResponse } = useAppSelector(
    selectAIRoadmapCreationState,
  );

  const { data: jobStatusData, refetch: refetchJobStatus } =
    useGetJobStatusQuery(
      {
        jobId: aiRoadmapCreationJobResponse?.job_id || '',
      },
      {
        skip:
          !aiRoadmapCreationJobResponse?.job_id ||
          status === 'completed' ||
          status === 'error',
        refetchOnFocus: true,
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true,
      },
    );

  useEffect(() => {
    if (!jobStatusData?.job_id) return;

    dispatch(
      setAiJobStatusAction({
        type: 'status',
        message: 'job status update from polling',
        ...jobStatusData,
      }),
    );

    if (jobStatusData?.status === 'failed') {
      dispatch(setCreationErrorAction(t('common.something_went_wrong')));
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } else if (jobStatusData?.status === 'completed') {
      if (jobStatusData?.result?.roadmap_id) {
        const roadmap = {
          roadmap_id: jobStatusData?.result?.roadmap_id,
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
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } else if (
      jobStatusData?.status === 'processing' ||
      jobStatusData?.status === 'pending'
    ) {
      setShouldReconnect(true);
    }
  }, [jobStatusData, dispatch, t]);

  useEffect(() => {
    if (!aiRoadmapCreationJobResponse?.ws_url) return;
    if (status === 'completed' || status === 'error') return;

    if (wsRef.current?.readyState === WebSocket.OPEN && !shouldReconnect) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsURL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/${aiRoadmapCreationJobResponse.ws_url}`;
    const ws = new WebSocket(wsURL, undefined, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });

    wsRef.current = ws;
    setShouldReconnect(false);

    ws.onmessage = (event) => {
      const jobStatusData = JSON.parse(event.data as string);
      dispatch(setAiJobStatusAction(jobStatusData));

      if (jobStatusData?.status === 'failed') {
        dispatch(setCreationErrorAction(t('common.something_went_wrong')));
      } else if (jobStatusData?.status === 'completed') {
        if (
          jobStatusData?.data?.roadmap_id ||
          jobStatusData?.result?.roadmap_id
        ) {
          const roadmap = {
            roadmap_id:
              jobStatusData?.data?.roadmap_id ||
              jobStatusData?.result?.roadmap_id,
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
        }
      }
    };

    ws.onerror = () => {
      // Don't immediately show error - let polling API determine actual status
      // This prevents false errors when phone is locked
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
    aiRoadmapCreationJobResponse?.ws_url,
    user.access_token,
    status,
    shouldReconnect,
    dispatch,
    t,
  ]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && status === 'creating') {
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

    return () => {
      subscription.remove();
    };
  }, [status, refetchJobStatus]);

  const handlePress = () => {
    if (isCompleted && createdRoadmap) {
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      dispatch(setDraftRoadmapAction(createdRoadmap));
      dispatch(resetCreationStateAction());
      router.navigate('/roadmap/roadmap-details');
    } else {
      router.navigate('/roadmap/create-ai-roadmap');
    }
  };

  const getBannerConfig = () => {
    if (isCompleted) {
      return {
        backgroundColor: Colors.success,
        iconName: 'checkmark' as const,
        titleKey: 'ai_roadmap.success_banner.title' as TranslationKeysType,
        descriptionKey:
          'ai_roadmap.success_banner.description' as TranslationKeysType,
      };
    }
    if (isInDraft) {
      return {
        backgroundColor: Colors.warning,
        iconName: 'document-text-outline' as const,
        titleKey: 'ai_roadmap.draft_banner.title' as TranslationKeysType,
        descriptionKey:
          'ai_roadmap.draft_banner.description' as TranslationKeysType,
      };
    }
    if (status === 'error') {
      return {
        backgroundColor: Colors.error,
        iconName: 'alert-circle-outline' as const,
        titleKey: 'ai_roadmap.error_banner.title' as TranslationKeysType,
        descriptionKey:
          'ai_roadmap.error_banner.description' as TranslationKeysType,
      };
    }
    return {
      backgroundColor: undefined,
      iconName: 'sparkles' as const,
      titleKey: 'ai_roadmap.in_progress_banner.title' as TranslationKeysType,
      descriptionKey:
        'ai_roadmap.in_progress_banner.description' as TranslationKeysType,
    };
  };

  const bannerConfig = getBannerConfig();

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDownWithSpring()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard onPress={handlePress}>
        <AppView row centerV>
          <AppView
            bg-primary={!isCompleted && !isInDraft}
            style={{
              backgroundColor:
                isCompleted || isInDraft || status === 'error'
                  ? bannerConfig.backgroundColor
                  : undefined,
              width: 48,
              height: 48,
            }}
            br100
            padding-8
            center>
            <AppIcon
              set="Ionicons"
              name={bannerConfig.iconName}
              size={20}
              color={Colors.white}
            />
          </AppView>
          <AppView flex-1 marginL-12 gap-4>
            <TranslatedText translationKey={bannerConfig.titleKey} />
            <TranslatedText xsm translationKey={bannerConfig.descriptionKey} />
          </AppView>
          <AppIcon
            set="Feather"
            name="chevron-right"
            size={20}
            color={Colors.textSecondary}
          />
        </AppView>
      </AppCard>
    </AppView>
  );
};
