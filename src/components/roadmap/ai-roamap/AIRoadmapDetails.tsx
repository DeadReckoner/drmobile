import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { MacroMapListItem } from '@/components/roadmap/ai-roamap/MacroMapListItem';
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
}
export const AIRoadmapDetails = ({
  roadmap,
  toggleEditMode,
  isRoadmapLoading,
}: AIRoadmapDetailsProps) => {
  const dispatch = useAppDispatch();

  const onViewMacroMap = () => {
    dispatch(setDraftRoadmapAction(roadmap));
    router.navigate('/(protected)/roadmap/ai-roadmap-macromap');
  };

  const onMacroMilestonePress = () => {
    // TODO: set the active milestone insteadof hardcoded first milestone
    if (roadmap.milestones?.[0].tasks?.length) {
      dispatch(
        setSelectedMilestoneAction({
          milestone: roadmap.milestones[0],
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
      <RoadmapOverview roadmap={roadmap} toggleEditMode={toggleEditMode} />
      <Divider marginT-16 />
      {isRoadmapLoading ? (
        <Loader transparent containerStyle={styles.loader} />
      ) : roadmap.macro_map?.phases[0].macro_milestones[0] ? (
        <AppView
          layout={FadingTransition}
          entering={FadeInDown}
          exiting={FadeOutUp}>
          <AppView row centerV spread marginB-16>
            <TranslatedText body2 translationKey="common.current_milestone" />
            <AppButton onPress={onViewMacroMap}>
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
          </AppView>
          {/* TODO: show the current running milestone */}
          {roadmap.macro_map?.phases[0].macro_milestones[0] && (
            <MacroMapListItem
              macroMilestone={roadmap.macro_map?.phases[0].macro_milestones[0]}
              icon={
                <AppButton onPress={onMacroMilestonePress}>
                  <AppIcon set="Feather" name="arrow-right" size={20} />
                </AppButton>
              }
            />
          )}
          {roadmap?.milestones?.length > 0 && (
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
