import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { RoadmapNudgeButton } from '@/components/roadmap/RoadmapNudgeButton';
import { TaskItem } from '@/components/roadmap/TaskItem';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import {
  MilestoneType,
  Phase,
  RoadmapType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { findOngoingMilestone } from '@/utils/roadmap.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const ReadonlyRoadmapDetails = () => {
  const { t } = useLocalization();
  const params = useLocalSearchParams<{ roadmap: string }>();
  const user = useAppSelector(selectUser);
  const scrollViewRef = useRef<ScrollView>(null);

  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [firstTabSelected, setFirstTabSelected] = useState(true);

  useEffect(() => {
    if (params.roadmap) {
      try {
        setRoadmap(JSON.parse(params.roadmap));
      } catch {}
    }
  }, [params.roadmap]);

  const finalRoadmap = roadmap;
  const isAnchor = !!user?.id && user.id === finalRoadmap?.anchor_id;

  const currentMilestone = useMemo<MilestoneType | null>(() => {
    if (!finalRoadmap) return null;
    const phases = finalRoadmap.phases ?? [];
    if (phases.length > 0) {
      for (const phase of phases) {
        const m = findOngoingMilestone(phase.milestones ?? []);
        if (m) return m;
      }
      return null;
    }
    return findOngoingMilestone(finalRoadmap.milestones ?? []) ?? null;
  }, [finalRoadmap]);

  const todayTasks = useMemo(
    () =>
      (currentMilestone?.tasks || []).filter(
        (task) => task.date && DateUtils.isSameDate(task.date, new Date()),
      ),
    [currentMilestone],
  );

  const handleOverviewPress = useCallback(
    (phase?: Phase) => {
      if (!finalRoadmap) return;
      if (finalRoadmap.type === 'custom_made') {
        router.navigate({
          pathname: '/settings/readonly-phase-milestones',
          params: { roadmap: JSON.stringify(finalRoadmap) },
        });
        return;
      }
      if (phase) {
        router.navigate({
          pathname: '/settings/readonly-phase-details',
          params: { roadmap: JSON.stringify(finalRoadmap) },
        });
      }
    },
    [finalRoadmap],
  );

  const handlePhasePress = useCallback(
    (phase: Phase) => {
      if (!finalRoadmap) return;
      router.navigate({
        pathname: '/settings/readonly-phase-milestones',
        params: {
          roadmap: JSON.stringify(finalRoadmap),
          phaseId: phase.phase_id,
          phaseLabel: String(phase.order_index),
        },
      });
    },
    [finalRoadmap],
  );

  const handleMilestonePress = useCallback(
    (milestone: MilestoneType, phase?: Phase) => {
      router.navigate({
        pathname: '/settings/readonly-phase-milestones-tasks',
        params: {
          tasks: JSON.stringify(milestone.tasks ?? []),
          phaseLabel: phase ? String(phase.order_index) : undefined,
          milestoneLabel: String(milestone.order_index),
        },
      });
    },
    [],
  );

  const handleTaskPress = useCallback((task: TaskType) => {
    router.navigate({
      pathname: '/settings/readonly-task-details',
      params: { task: JSON.stringify(task) },
    });
  }, []);

  const renderTaskItem = useCallback(
    ({ item }: LegendListRenderItemProps<TaskType>) => (
      <TaskItem task={item} onTaskClick={handleTaskPress} />
    ),
    [handleTaskPress],
  );

  if (!finalRoadmap) return null;

  return (
    <AppScreen safeArea>
      <ScrollView
        ref={scrollViewRef}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>
        <Divider />
        <AppSegmentControl
          segments={[t('tabs.today'), t('settings.roadmaps').slice(0, 7)]}
          selectedIndex={firstTabSelected ? 0 : 1}
          onSegmentChange={(index) => setFirstTabSelected(index === 0)}
        />

        <AppView reanimated layout={Animations.Layout.Springify()}>
          {firstTabSelected ? (
            <AppView
              key="today-tab"
              flex
              useSafeArea
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <Divider />
              <AppCard onPress={() => setFirstTabSelected(false)}>
                <AppView flex gap-12>
                  <AppText subtitle1 regular textColor>
                    {finalRoadmap.goal}
                  </AppText>
                  <AppView row flex centerV gap-16>
                    <AppText body1 light textColor flex-0>
                      {t('roadmap.progress')}:
                    </AppText>
                    <AppProgressBar
                      style={[
                        styles.progressBar,
                        { backgroundColor: Colors.outline },
                      ]}
                      fullWidth
                      progress={finalRoadmap.progress || 0}
                      progressColor={Colors.primary}
                    />
                    <AppText body1 light textColor>
                      {finalRoadmap.progress || 0}%
                    </AppText>
                  </AppView>
                  {currentMilestone && (
                    <AppText body1 light textColor>
                      {t('common.current_milestone')}:{' '}
                      {currentMilestone.sub_goal}
                    </AppText>
                  )}
                </AppView>
              </AppCard>
              <Divider />
              <AppList<TaskType>
                keyExtractor={(i) => i.task_id}
                data={todayTasks}
                renderItem={renderTaskItem}
                ListEmptyComponent={() => (
                  <EmptyListItemPlaceholder
                    title="tabs.create_tab.no_tasks_or_habits_yet"
                    subtitle="tabs.create_tab.no_tasks_or_habits_description"
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListFooterComponent={() => <Divider />}
              />
            </AppView>
          ) : (
            <AppView
              key="overview-tab"
              flex
              gap-12
              useSafeArea
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <RoadmapCurrentStateOverview
                key={finalRoadmap.roadmap_id}
                roadmap={finalRoadmap}
                roadmapCreateStartControls={null}
                onOverviewPress={handleOverviewPress}
                onPhasePress={handlePhasePress}
                onMilestonePress={handleMilestonePress}
              />
            </AppView>
          )}
        </AppView>
      </ScrollView>

      {isAnchor && finalRoadmap.roadmap_id && (
        <RoadmapNudgeButton roadmapId={finalRoadmap.roadmap_id} />
      )}
    </AppScreen>
  );
};

export default ReadonlyRoadmapDetails;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '50%',
  },
});
