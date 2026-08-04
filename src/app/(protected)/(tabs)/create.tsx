import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { CreateTabListItem } from '@/components/roadmap/CreateTabListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  CREATE_OPTION_ROUTES,
  CREATE_PAGE_SECTIONS,
  CreateOptionId,
} from '@/hooks/createTab/createTabCatalog';
import { resolveEntry, routeForEntry } from '@/hooks/goalDiscovery/draft';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetCreationStateAction,
  selectAIRoadmapCreationStatus,
  selectAIRoadmapMessages,
  selectCreatedRoadmap,
  selectRoadmapCreationSource,
} from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import { selectGoalDiscoveryDraft } from '@/store/slices/goalDiscoverySlice';
import {
  resetDraftAction,
  setDraftRoadmapAction,
  setSelectedHabit,
} from '@/store/slices/roadmapDraftSlice';
import { router } from 'expo-router';
import { JSX, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const OPTION_ICONS: Record<CreateOptionId, JSX.Element> = {
  build_with_ai: <AppIcon set="Feather" name="map" color={Colors.white} />,
  goal_discovery: <AppIcon set="Feather" name="compass" color={Colors.white} />,
  templates: <AppIcon set="Feather" name="layers" color={Colors.white} />,
  build_a_roadmap: <AppIcon set="Feather" name="map" color={Colors.white} />,
  import_plan: <AppIcon name="export" color={Colors.white} />,
  add_task_or_habit: <AppIcon name="addfile" color={Colors.white} />,
};

const Create = () => {
  const dispatch = useAppDispatch();
  const aiRoadmapStatus = useAppSelector(selectAIRoadmapCreationStatus);
  const createdRoadmap = useAppSelector(selectCreatedRoadmap);
  const messages = useAppSelector(selectAIRoadmapMessages);
  const creationSource = useAppSelector(selectRoadmapCreationSource);
  const goalDiscoveryDraft = useAppSelector(selectGoalDiscoveryDraft);
  const user = useAppSelector(selectUser);
  const [isAIDraftDialogOpen, setIsAIDraftDialogOpen] = useState(false);

  const hasUserMessage = messages.some((msg) => msg.type === 'user');

  /**
   * Whether the shared creation slice is tracking a GOAL DISCOVERY roadmap.
   *
   * Both flows write to that slice, so its status alone cannot decide where a
   * "Continue" leads. Without this distinction, a roadmap started from the
   * goal discovery FORM made this card offer a Continue that opened the chat
   * screen — a conversation the user never had, showing a loader.
   */
  const isGoalDiscoveryRoadmapPending =
    creationSource === 'goal_discovery_form' &&
    (aiRoadmapStatus === 'creating' ||
      aiRoadmapStatus === 'completed' ||
      aiRoadmapStatus === 'error');

  const hasAIDraftInProgress =
    aiRoadmapStatus === 'completed' ||
    aiRoadmapStatus === 'creating' ||
    (aiRoadmapStatus === 'collecting' && hasUserMessage);

  /** Where the goal discovery entry point should go right now. */
  const goToGoalDiscovery = () => {
    router.navigate(routeForEntry(resolveEntry(goalDiscoveryDraft, user.id)));
  };

  const onAIRoadmapPress = () => {
    // A goal discovery roadmap in flight gets its OWN dialog, whose only
    // forward action returns to goal discovery. Starting a fresh chat is still
    // offered; opening the chat screen as a "continue" is not.
    if (isGoalDiscoveryRoadmapPending) {
      setIsAIDraftDialogOpen(true);
      return;
    }
    if (hasAIDraftInProgress) {
      setIsAIDraftDialogOpen(true);
    } else {
      router.navigate(CREATE_OPTION_ROUTES.build_with_ai);
    }
  };

  const handleResetAndStart = () => {
    dispatch(resetCreationStateAction());
    setIsAIDraftDialogOpen(false);
    router.navigate(CREATE_OPTION_ROUTES.build_with_ai);
  };

  const handleGoToRoadmap = () => {
    setIsAIDraftDialogOpen(false);

    // A completed roadmap opens through the existing roadmap destination
    // whichever flow produced it — the result of goal discovery is an ordinary
    // roadmap.
    if (aiRoadmapStatus === 'completed' && createdRoadmap) {
      dispatch(setDraftRoadmapAction(createdRoadmap));
      dispatch(resetCreationStateAction());
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      router.navigate('/roadmap/roadmap-execution');
      return;
    }

    // Still generating: the source decides the destination.
    if (isGoalDiscoveryRoadmapPending) {
      goToGoalDiscovery();
      return;
    }
    router.navigate(CREATE_OPTION_ROUTES.build_with_ai);
  };

  const onCustomRoadmapPress = () => {
    dispatch(resetDraftAction());
    router.navigate(CREATE_OPTION_ROUTES.build_a_roadmap);
  };

  const onAddNewHabitPress = () => {
    dispatch(setSelectedHabit(null));
    router.navigate(CREATE_OPTION_ROUTES.add_task_or_habit);
  };

  /**
   * What tapping each catalog option does. Options with pending-flow or draft
   * rules keep their dedicated handlers; the rest just open their route.
   * Goal Discovery resumes this user's saved draft or pending job when there
   * is one, and otherwise starts at the form. It never enters the chat flow,
   * and never starts a generation just from being opened.
   */
  const onPressByOption: Record<CreateOptionId, () => void> = {
    build_with_ai: onAIRoadmapPress,
    goal_discovery: goToGoalDiscovery,
    templates: () => router.navigate(CREATE_OPTION_ROUTES.templates),
    build_a_roadmap: onCustomRoadmapPress,
    import_plan: () => router.navigate(CREATE_OPTION_ROUTES.import_plan),
    add_task_or_habit: onAddNewHabitPress,
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContent}>
        <Divider />
        <TranslatedText h2 translationKey="tabs.create" />
        <Divider margin-4 />
        <AppView gap-20>
          {CREATE_PAGE_SECTIONS.map((section) => (
            <AppView key={section.id} gap-8>
              <TranslatedText
                caption
                color={Colors.secondary}
                style={styles.sectionHeading}
                translationKey={section.labelKey}
              />
              {section.options.map((option) => (
                <CreateTabListItem
                  key={option.id}
                  compact
                  treatment={option.treatment}
                  titleKey={option.titleKey}
                  descriptionKey={option.descriptionKey}
                  onPress={onPressByOption[option.id]}
                  icon={OPTION_ICONS[option.id]}
                />
              ))}
            </AppView>
          ))}
        </AppView>
      </ScrollView>
      <ConfirmationDialog
        isDialogOpen={isAIDraftDialogOpen}
        onDismiss={() => setIsAIDraftDialogOpen(false)}
        title={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.completed_title'
            : isGoalDiscoveryRoadmapPending
              ? 'ai_roadmap.draft_dialog.goal_discovery_title'
              : 'ai_roadmap.draft_dialog.in_progress_title'
        }
        subtitle={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.completed_subtitle'
            : isGoalDiscoveryRoadmapPending
              ? 'ai_roadmap.draft_dialog.goal_discovery_subtitle'
              : 'ai_roadmap.draft_dialog.in_progress_subtitle'
        }
        onPositivePress={handleResetAndStart}
        onNegativePress={handleGoToRoadmap}
        positiveText="ai_roadmap.draft_dialog.reset_button"
        negativeText={
          aiRoadmapStatus === 'completed'
            ? 'ai_roadmap.draft_dialog.view_button'
            : isGoalDiscoveryRoadmapPending
              ? 'ai_roadmap.draft_dialog.goal_discovery_button'
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

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  sectionHeading: { textTransform: 'uppercase', letterSpacing: 1.2 },
});

export default Create;
