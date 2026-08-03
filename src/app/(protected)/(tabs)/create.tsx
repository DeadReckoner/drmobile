import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { CreateTabListItem } from '@/components/roadmap/CreateTabListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { resolveEntry } from '@/hooks/goalDiscovery/draft';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetCreationStateAction,
  selectAIRoadmapCreationStatus,
  selectAIRoadmapMessages,
  selectCreatedRoadmap,
} from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import { selectGoalDiscoveryDraft } from '@/store/slices/goalDiscoverySlice';
import {
  resetDraftAction,
  setDraftRoadmapAction,
  setSelectedHabit,
} from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Create = () => {
  const dispatch = useAppDispatch();
  const aiRoadmapStatus = useAppSelector(selectAIRoadmapCreationStatus);
  const createdRoadmap = useAppSelector(selectCreatedRoadmap);
  const messages = useAppSelector(selectAIRoadmapMessages);
  const goalDiscoveryDraft = useAppSelector(selectGoalDiscoveryDraft);
  const user = useAppSelector(selectUser);
  const [isAIDraftDialogOpen, setIsAIDraftDialogOpen] = useState(false);

  const hasUserMessage = messages.some((msg) => msg.type === 'user');

  const hasAIDraftInProgress =
    aiRoadmapStatus === 'completed' ||
    aiRoadmapStatus === 'creating' ||
    (aiRoadmapStatus === 'collecting' && hasUserMessage);

  const onAIRoadmapPress = () => {
    if (hasAIDraftInProgress) {
      setIsAIDraftDialogOpen(true);
    } else {
      router.navigate('/roadmap/create-ai-roadmap');
    }
  };

  const handleResetAndStart = () => {
    dispatch(resetCreationStateAction());
    setIsAIDraftDialogOpen(false);
    router.navigate('/roadmap/create-ai-roadmap');
  };

  const handleGoToRoadmap = () => {
    setIsAIDraftDialogOpen(false);
    if (aiRoadmapStatus === 'completed' && createdRoadmap) {
      dispatch(setDraftRoadmapAction(createdRoadmap));
      dispatch(resetCreationStateAction());
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      router.navigate('/roadmap/roadmap-execution');
    } else {
      router.navigate('/roadmap/create-ai-roadmap');
    }
  };

  /**
   * Goal Discovery resumes this user's saved draft or pending job when there is
   * one, and otherwise starts at the form. It never enters the chat flow, and
   * never starts a generation just from being opened.
   */
  const onGoalDiscoveryPress = () => {
    const entry = resolveEntry(goalDiscoveryDraft, user.id);
    if (entry.route === 'options') {
      router.navigate('/goal-discovery/options');
      return;
    }
    if (entry.route === 'stage2') {
      router.navigate('/goal-discovery/roadmap-details');
      return;
    }
    router.navigate('/goal-discovery');
  };

  const onCustomRoadmapPress = () => {
    dispatch(resetDraftAction());
    router.navigate('/roadmap/add-edit-custom-roadmap');
  };
  const onAddNewHabitPress = () => {
    dispatch(setSelectedHabit(null));
    router.navigate('/habits/add-edit-habits-task');
  };
  const navigateToComingSoon = () => {
    router.navigate('/coming-soon');
  };
  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <Divider />
        <TranslatedText h2 translationKey="tabs.create" />
        <Divider />
        <AppView gap-16>
          <CreateTabListItem
            type="ai"
            titleKey="tabs.create_tab.build_roadmap_ai"
            descriptionKey="tabs.create_tab.build_roadmap_ai_desc"
            onPress={onAIRoadmapPress}
            icon={<AppIcon set="Feather" name="map" color={Colors.white} />}
          />
          <CreateTabListItem
            type="ai"
            titleKey="tabs.create_tab.goal_discovery"
            descriptionKey="tabs.create_tab.goal_discovery_desc"
            onPress={onGoalDiscoveryPress}
            icon={<AppIcon set="Feather" name="compass" color={Colors.white} />}
          />
          <CreateTabListItem
            type="custom"
            titleKey="tabs.create_tab.build_roadmap_custom"
            descriptionKey="tabs.create_tab.build_roadmap_custom_desc"
            onPress={onCustomRoadmapPress}
            icon={<AppIcon set="Feather" name="map" color={Colors.white} />}
          />
          <CreateTabListItem
            type="task"
            titleKey="tabs.create_tab.add_new_task_or_habit"
            descriptionKey="tabs.create_tab.add_new_task_desc"
            icon={<AppIcon name="addfile" color={Colors.white} />}
            onPress={onAddNewHabitPress}
          />
          <CreateTabListItem
            type="import_plan"
            titleKey="tabs.create_tab.import_plan"
            descriptionKey="tabs.create_tab.import_plan_desc"
            onPress={navigateToComingSoon}
            icon={<AppIcon name="export" color={Colors.white} />}
          />
          <Divider />
        </AppView>
      </ScrollView>
      <ConfirmationDialog
        isDialogOpen={isAIDraftDialogOpen}
        onDismiss={() => setIsAIDraftDialogOpen(false)}
        title={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.completed_title'
            : 'ai_roadmap.draft_dialog.in_progress_title'
        }
        subtitle={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.completed_subtitle'
            : 'ai_roadmap.draft_dialog.in_progress_subtitle'
        }
        onPositivePress={handleResetAndStart}
        onNegativePress={handleGoToRoadmap}
        positiveText="ai_roadmap.draft_dialog.reset_button"
        negativeText={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.view_button'
            : 'ai_roadmap.draft_dialog.continue_button'
        }
        positiveButtonIcon={
          <AppIcon
            set="Feather"
            name="refresh-cw"
            color={Colors.textOnPrimary}
            size={14}
          />
        }
        negativeButtonIcon={
          <AppIcon
            set="Feather"
            name="arrow-right"
            color={Colors.textOnPrimary}
            size={14}
          />
        }
      />
    </AppScreen>
  );
};

export default Create;
