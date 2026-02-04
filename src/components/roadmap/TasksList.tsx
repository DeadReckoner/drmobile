import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { TaskItem } from '@/components/roadmap/TaskItem';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setSelectedTaskAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';

interface TasksListProps {
  tasks: TaskType[];
  onTaskClick?: (_task: TaskType) => void;
}

export const TasksList = ({ tasks, onTaskClick }: TasksListProps) => {
  const dispatch = useAppDispatch();
  const handleTaskClick = (task: TaskType, index: number) => {
    dispatch(setShouldSyncWithServerAction(true));
    dispatch(setSelectedTaskAction({ task, index }));
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      router.navigate(`/task/today-task-details`);
    }
  };

  const renderItem = ({ item, index }: LegendListRenderItemProps<TaskType>) => {
    return (
      <TaskItem
        task={item}
        onTaskClick={(task) => handleTaskClick(task, index)}
      />
    );
  };

  const renderEmptyComponent = () => {
    return (
      <EmptyListItemPlaceholder
        title="tabs.create_tab.no_tasks_yet"
        subtitle="tabs.create_tab.no_tasks_description"
      />
    );
  };
  return (
    <AppList<TaskType>
      keyExtractor={(i) => i.task_id}
      data={tasks || []}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => <Divider />}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};
