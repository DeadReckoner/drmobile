import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { StrategicMilestoneListItem } from '@/components/roadmap/ai-roamap/StrategicMilestoneListItem';
import { RoadmapOverview } from '@/components/roadmap/RoadmapOverview';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import type { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setDraftRoadmapAction,
  setSelectedMilestoneAction,
} from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  FadeInDown,
  FadeOutUp,
  FadingTransition,
} from 'react-native-reanimated';

interface AIRoadmapDetailsProps {
  roadmap: RoadmapType;
  isRoadmapLoading?: boolean;
  toggleEditMode: () => void;
  readonly?: boolean;
}
export const AIRoadmapDetails = ({
  roadmap,
  toggleEditMode,
  isRoadmapLoading,
  readonly = false,
}: AIRoadmapDetailsProps) => {
  const dispatch = useAppDispatch();

  const onViewStrategicMap = () => {
    dispatch(setDraftRoadmapAction(roadmap));
    router.navigate('/(protected)/roadmap/ai-roadmap-macromap');
  };

  const firstNonCompletedMilestoneIndex = useMemo(() => {
    const index = roadmap.milestones?.findIndex(
      (milestone) => !milestone.reached,
    );
    return index === -1 ? 0 : index;
  }, [roadmap.milestones]);

  const currentMilestone = useMemo(() => {
    const allMilestones =
      roadmap.phases?.flatMap((p) => p.milestones || []) || [];
    return allMilestones[firstNonCompletedMilestoneIndex];
  }, [roadmap.phases, firstNonCompletedMilestoneIndex]);

  const onMilestonePress = () => {
    if (roadmap.milestones?.[firstNonCompletedMilestoneIndex].tasks?.length) {
      dispatch(
        setSelectedMilestoneAction({
          milestone: roadmap.milestones[firstNonCompletedMilestoneIndex],
        }),
      );
      router.navigate({
        pathname: '/(protected)/roadmap/add-edit-milestone',
        params: { showTasksList: 'true', mode: 'edit' },
      });
    }
  };

  return (
    <AppView flex>
      <RoadmapOverview
        roadmap={roadmap}
        toggleEditMode={toggleEditMode}
        readonly={readonly}
      />
      <Divider marginT-16 />
      {isRoadmapLoading ? (
        <Loader transparent containerStyle={styles.loader} />
      ) : currentMilestone ? (
        <AppView
          layout={FadingTransition}
          entering={FadeInDown}
          exiting={FadeOutUp}>
          <AppView row centerV spread marginB-16>
            <TranslatedText body2 translationKey="common.current_milestone" />
            {!readonly && (
              <AppButton onPress={onViewStrategicMap}>
                <AppView right>
                  <AppView
                    row
                    center
                    gap-8
                    br100
                    padding-4
                    paddingH-12
                    bg-lightCardBG>
                    <TranslatedText xsm translationKey="common.view_map" />
                  </AppView>
                </AppView>
              </AppButton>
            )}
          </AppView>
          {currentMilestone && (
            <StrategicMilestoneListItem
              milestone={currentMilestone}
              onPress={readonly ? () => {} : onMilestonePress}
            />
          )}
          {!readonly && roadmap?.milestones?.length > 0 && (
            <AppButton
              onPress={() => {
                router.navigate(
                  '/(protected)/roadmap/ai-roadmap-all-milestones',
                );
              }}>
              <AppView right>
                <AppView
                  row
                  center
                  marginT-16
                  gap-8
                  br100
                  padding-8
                  paddingH-12
                  bg-lightCardBG>
                  <TranslatedText
                    xsm
                    translationKey="ai_roadmap.see_all_milestones"
                  />
                  <AppIcon set="Feather" name="arrow-right-circle" size={16} />
                </AppView>
              </AppView>
            </AppButton>
          )}
        </AppView>
      ) : null}
    </AppView>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: 'relative',
    marginRight: 8,
  },
});
