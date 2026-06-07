import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { GradientBackdrop } from '@/components/GradientBackdrop';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { NextMilestoneGenerationLoader } from '@/components/roadmap/ai-roamap/NextMilestoneGenerationLoader';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { LevelBadge } from '@/components/roadmap/LevelBadge';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { MilestoneType, TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentIndex } from '@/hooks/useScrollToCurrentItem';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  resetMilestoneGenerationAction,
  selectIsNextMilestoneCompleted,
  selectIsNextMilestoneGenerating,
} from '@/store/slices/nextMilestoneGenerationSlice';
import {
  selectMilestoneTasks,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import { buildBadgeLabel, findOngoingTask } from '@/utils/roadmap.utils';
import { consumeMilestone } from '@/utils/roadmapTransfer';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [currentMilestone] = useState<MilestoneType>(
    () => consumeMilestone() ?? ({} as MilestoneType),
  );
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

  const { listRef } = useScrollToCurrentIndex(currentTaskIndex, tasks.length);

  const isGeneratingForThisMilestone = useAppSelector(
    selectIsNextMilestoneGenerating(params.milestoneId),
  );
  const isCompletedForThisMilestone = useAppSelector(
    selectIsNextMilestoneCompleted(params.milestoneId),
  );

  const shouldShowGenerateNextMilestone =
    !isGeneratingForThisMilestone &&
    currentMilestone?.status === 'in_progress' &&
    (!tasks || tasks.length === 0);

  useEffect(() => {
    if (isCompletedForThisMilestone) {
      dispatch(resetMilestoneGenerationAction());
    }
  }, [isCompletedForThisMilestone, dispatch]);

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
    <AppScreen safeArea paddingH-0>
      {isRoadmapRefetching && <Loader />}
      {isGeneratingForThisMilestone && <NextMilestoneGenerationLoader />}
      <AppView flex paddingH-16>
        <HeaderWithBack headerKey="common.tasks" />
        <Divider />
        <AppList
          keyExtractor={(i) => i.task_id}
          ref={listRef}
          data={tasks}
          contentContainerStyle={styles.scrollContainer}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <EmptyListItemPlaceholder
              title="roadmap.no_tasks_today"
              subtitle="roadmap.no_tasks_today_description"
            />
          )}
        />
      </AppView>
      {shouldShowGenerateNextMilestone && (
        <AppView bg-transparent pointerEvents="box-none">
          <GradientBackdrop />
          <AppView center style={styles.bottomBannerContainer}>
            <AppButton
              onPress={() => {
                router.navigate({
                  pathname: '/roadmap/generate-next-milestone',
                  params: {
                    milestoneId: params.milestoneId,
                  },
                });
              }}>
              <AppView
                row
                gap-8
                center
                bg-accent
                br100
                padding-12
                paddingH-24
                style={{
                  borderColor: Colors.success,
                }}>
                <TranslatedText
                  body2
                  translationKey="ai_roadmap.generate_milestone"
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
  scrollContainer: {
    paddingBottom: 120,
  },
});
