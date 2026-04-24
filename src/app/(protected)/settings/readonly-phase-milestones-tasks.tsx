import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { LevelBadge } from '@/components/roadmap/LevelBadge';
import { AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentIndex } from '@/hooks/useScrollToCurrentItem';
import { DateUtils } from '@/utils/date.utils';
import { buildBadgeLabel, findOngoingTask } from '@/utils/roadmap.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Colors } from 'react-native-ui-lib';

const ReadonlyPhaseMilestonesTasks = () => {
  const params = useLocalSearchParams<{
    tasks: string;
    phaseLabel?: string;
    milestoneLabel?: string;
  }>();
  const { t } = useLocalization();
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    if (params.tasks) {
      try {
        setTasks(JSON.parse(params.tasks));
      } catch {}
    }
  }, [params.tasks]);

  const currentTask = findOngoingTask(tasks);

  const currentTaskIndex = useMemo(() => {
    if (!currentTask) return -1;
    return tasks.findIndex((task) => task.task_id === currentTask.task_id);
  }, [tasks, currentTask]);

  const { listRef } = useScrollToCurrentIndex(currentTaskIndex);

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
          router.navigate({
            pathname: '/settings/readonly-task-details',
            params: { task: JSON.stringify(item) },
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
    </AppScreen>
  );
};

export default ReadonlyPhaseMilestonesTasks;
