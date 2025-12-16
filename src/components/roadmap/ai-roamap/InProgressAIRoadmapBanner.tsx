import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetJobStatusQuery } from '@/hooks/roadmap';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  completeRoadmapCreationAction,
  selectAIRoadmapCreationState,
  selectAIRoadmapCreationStatus,
  selectCreatedRoadmap,
  selectIsAIRoadmapInDraft,
} from '@/store/slices/aiRoadmapCreationSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Colors } from 'react-native-ui-lib';

export const InProgressAIRoadmapBanner = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAIRoadmapCreationStatus);
  const createdRoadmap = useAppSelector(selectCreatedRoadmap);
  const isInDraft = useAppSelector(selectIsAIRoadmapInDraft);

  const { aiRoadmapCreationJobResponse } = useAppSelector(
    selectAIRoadmapCreationState,
  );

  const [hasError, setHasError] = useState(false);

  const shouldSkipPolling = React.useMemo(() => {
    if (!aiRoadmapCreationJobResponse?.job_id) return true;
    if (status === 'completed' || status === 'error') return true;
    return false;
  }, [aiRoadmapCreationJobResponse?.job_id, status]);

  // TODO N : Setup websocket to get the real time update status for roadmap creation.
  // If job status is failed then stop polling and show error message.
  // If completed then navigate to roadmap-details page with roadmap id(job result response has the roadmap-id)
  // Same functionality should be implemente in the progress page to show the status of AI roadmap creation.

  const { data: jobStatusData } = useGetJobStatusQuery(
    {
      jobId: aiRoadmapCreationJobResponse?.job_id || '',
    },
    {
      skip: shouldSkipPolling || !aiRoadmapCreationJobResponse?.job_id,
      pollingInterval: 60_000,
    },
  );

  useEffect(() => {
    if (jobStatusData?.status === 'failed') {
      setHasError(true);
    } else if (jobStatusData?.status === 'completed') {
      if (jobStatusData?.result?.roadmap_id) {
        const roadmap = {
          roadmap_id: jobStatusData.result.roadmap_id,
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
  }, [jobStatusData, dispatch]);

  const isCompleted = status === 'completed';

  const handlePress = () => {
    if (isCompleted && createdRoadmap) {
      dispatch(setDraftRoadmapAction(createdRoadmap));
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
    if (hasError) {
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
                isCompleted || isInDraft
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
