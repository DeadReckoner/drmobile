import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';

interface TaskItemProps {
  task: TaskType;
  onTaskClick?: (_task: TaskType) => void;
}

export const TaskItem = ({ task, onTaskClick }: TaskItemProps) => {
  return (
    <AppCard row centerV onPress={() => onTaskClick?.(task)}>
      <AppCheckbox value={task?.status === 'completed'} />
      <Divider />
      <AppView flex-1>
        <AppText body2 textColor numberOfLines={2}>
          {task.title}
        </AppText>
        <AppText xsm textColor marginT-4 numberOfLines={3}>
          {task.description}
        </AppText>
      </AppView>
    </AppCard>
  );
};
