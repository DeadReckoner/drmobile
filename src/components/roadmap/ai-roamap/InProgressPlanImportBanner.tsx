import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetPlanImportAction,
  selectPlanImportCreatedRoadmap,
  selectPlanImportStatus,
} from '@/store/slices/planImportSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React from 'react';
import { Colors } from 'react-native-ui-lib';

export const InProgressPlanImportBanner = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectPlanImportStatus);
  const createdRoadmap = useAppSelector(selectPlanImportCreatedRoadmap);

  const handlePress = () => {
    if (status === 'completed' && createdRoadmap) {
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      dispatch(setDraftRoadmapAction(createdRoadmap));
      dispatch(resetPlanImportAction());
      router.navigate('/roadmap/roadmap-execution');
    } else {
      router.navigate('/roadmap/import-plan');
    }
  };

  const getBannerConfig = () => {
    if (status === 'completed') {
      return {
        backgroundColor: Colors.success,
        iconName: 'checkmark' as const,
        titleKey: 'plan_import.success_banner.title' as TranslationKeysType,
        descriptionKey:
          'plan_import.success_banner.description' as TranslationKeysType,
      };
    }
    if (status === 'error') {
      return {
        backgroundColor: Colors.error,
        iconName: 'alert-circle-outline' as const,
        titleKey: 'plan_import.error_banner.title' as TranslationKeysType,
        descriptionKey:
          'plan_import.error_banner.description' as TranslationKeysType,
      };
    }
    return {
      backgroundColor: undefined,
      iconName: 'document-text-outline' as const,
      titleKey: 'plan_import.in_progress_banner.title' as TranslationKeysType,
      descriptionKey:
        'plan_import.in_progress_banner.description' as TranslationKeysType,
    };
  };

  const bannerConfig = getBannerConfig();
  const isCompleted = status === 'completed';
  const isError = status === 'error';

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDownWithSpring()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard onPress={handlePress}>
        <AppView row centerV>
          <AppView
            bg-primary={!isCompleted && !isError}
            style={{
              backgroundColor:
                isCompleted || isError
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
