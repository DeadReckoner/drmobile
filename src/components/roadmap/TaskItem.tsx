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
      <AppCheckbox
        value={
          (task?.steps?.length > 0 && task.steps?.every((s) => s.completed)) ||
          false
        }
      />
      <Divider />
      <AppView flex-1>
        <AppText body2 textColor>
          {task.title}
        </AppText>
        <AppText xsm textColor marginT-4>
          {task.description}
        </AppText>
      </AppView>
    </AppCard>
  );
};
