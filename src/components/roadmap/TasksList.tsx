import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { TaskItem } from '@/components/roadmap/TaskItem';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedTaskAction } from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';

interface TasksListProps {
  tasks: TaskType[];
}

export const TasksList = ({ tasks }: TasksListProps) => {
  const dispatch = useAppDispatch();
  const handleTaskClick = (task: TaskType) => {
    dispatch(setSelectedTaskAction({ task, index: -1 }));
    router.navigate({
      pathname: `/task/[task_id]`,
      params: {
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        milestone_id: task.milestone_id,
      },
    });
  };

  const renderItem = ({ item }: LegendListRenderItemProps<TaskType>) => {
    return <TaskItem task={item} onTaskClick={handleTaskClick} />;
  };
  return (
    <AppList<TaskType>
      keyExtractor={(i) => i.task_id}
      data={tasks || []}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <Divider margin-8 />}
    />
  );
};
