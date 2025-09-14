import { AppCard } from '@/components/AppCard';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';

interface TaskItemProps {
  task: TaskType;
  onTaskClick?: (_task: TaskType) => void;
}

export const TaskItem = ({ task, onTaskClick }: TaskItemProps) => {
  return (
    <AppCard row centerV onPress={() => onTaskClick?.(task)}>
      <AppCheckbox value={task.completed} />
      <AppView marginL-16>
        <AppText body2 textColor>
          {task.title}
        </AppText>
        <AppText xsm textColor marginT-8>
          {task.description}
        </AppText>
      </AppView>
    </AppCard>
  );
};
