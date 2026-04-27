import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { GradientBackdrop } from '@/components/roadmap/ai-roamap/GradientRoadmap';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { LevelBadge } from '@/components/roadmap/LevelBadge';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentIndex } from '@/hooks/useScrollToCurrentItem';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectMilestoneTasks,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import { buildBadgeLabel, findOngoingTask } from '@/utils/roadmap.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const PhaseMilestonesTasks = () => {
  const params = useLocalSearchParams<{
    milestoneId: string;
    phaseId?: string;
    phaseLabel?: string;
    milestoneLabel?: string;
  }>();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const roadmapId = useAppSelector(
    (state) => state.roadmapDraft.roadmap.roadmap_id,
  );
  const { isFetching: isRoadmapRefetching } =
    roadmapApi.endpoints.getRoadmapById.useQueryState(roadmapId);
  const tasks = useAppSelector(selectMilestoneTasks(params.milestoneId));

  const currentTask = findOngoingTask(tasks);

  const currentTaskIndex = useMemo(() => {
    if (!currentTask) return -1;
    return tasks.findIndex((t) => t.task_id === currentTask.task_id);
  }, [tasks, currentTask]);

  const { listRef } = useScrollToCurrentIndex(currentTaskIndex);

  const allTasksCompleted = useMemo(() => {
    return tasks.every((t) => t.status === 'completed');
  }, [tasks]);

  const renderItem = ({ item, index }: { item: TaskType; index: number }) => {
    const badgeLabel = buildBadgeLabel({
      phase: params.phaseLabel,
      milestone: params.milestoneLabel,
      task: index + 1,
    });
    const isCurrentTask = item.task_id === currentTask?.task_id;
    const badgeStatus = item.status;
    return (
      <AppCard
        onPress={() => {
          dispatch(setSelectedTaskAction({ task: item }));
          router.navigate({
            pathname: '/task/today-task-details',
          });
        }}
        style={{
          borderWidth: 3,
          borderColor: isCurrentTask ? Colors.accent : 'transparent',
        }}>
        <AppView gap-4>
          <AppView row>
            <AppText body1 textColor flex>
              {item.title}
            </AppText>
            <LevelBadge
              label={badgeLabel}
              status={isCurrentTask ? 'in_progress' : badgeStatus}
            />
          </AppView>

          <AppText xsm textColor>
            {t('common.description')}: {item.description}
          </AppText>
          {item.date && (
            <AppText xsm textColor>
              {t('common.date')}: {DateUtils.formatDate(item.date)}
            </AppText>
          )}
        </AppView>
      </AppCard>
    );
  };

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.tasks" />
      <Divider />
      {isRoadmapRefetching && <Loader />}
      <AppList
        keyExtractor={(i) => i.task_id}
        ref={listRef}
        data={tasks}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <EmptyListItemPlaceholder
            title="roadmap.no_tasks_today"
            subtitle="roadmap.no_tasks_today_description"
          />
        )}
      />

      {allTasksCompleted && (
        <AppView bg-transparent pointerEvents="box-none">
          <GradientBackdrop />
          <AppView center style={styles.bottomBannerContainer}>
            <AppButton onPress={() => {}}>
              <AppView
                row
                gap-8
                center
                bg-success
                br100
                padding-12
                paddingH-24
                style={{
                  borderColor: Colors.success,
                }}>
                <TranslatedText
                  body2
                  translationKey="ai_roadmap.draft_dialog.generate_next_milestone"
                />
                <AppIcon
                  set="Ionicons"
                  name="arrow-forward-circle-outline"
                  size={24}
                  color={Colors.white}
                />
              </AppView>
            </AppButton>
          </AppView>
        </AppView>
      )}
    </AppScreen>
  );
};

export default PhaseMilestonesTasks;

const styles = StyleSheet.create({
  bottomBannerContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
  },
});
