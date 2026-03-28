import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import dayjs from 'dayjs';
import React, { useCallback, useMemo } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface MilestoneTaskItemProps {
  task: TaskType;
  onPress: (_task: TaskType) => void;
  readonly?: boolean;
}

const MilestoneTaskItemComponent = ({
  task,
  onPress,
  readonly = false,
}: MilestoneTaskItemProps) => {
  const scale = useSharedValue(1);

  const iconStyles = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [],
  );

  const onPressIn = useCallback(() => {
    scale.value = withSequence(withSpring(0.7), withSpring(1.2));
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress(task);
  }, [onPress, task]);

  const isTaskCompleted = useMemo(
    () =>
      readonly
        ? task?.status === 'completed'
        : task?.steps?.length > 0 &&
          task.steps?.every((step) => step.completed),
    [readonly, task?.status, task?.steps],
  );

  const formattedDate = useMemo(
    () => dayjs(task.date).format('MM/DD/YYYY'),
    [task.date],
  );

  return (
    <AppView row paddingL-32 paddingV-16 paddingR-18 gap-16 center>
      <AppCheckbox value={isTaskCompleted} />
      <AppView flex>
        <AppText flex textColor body2>
          {task.title}
        </AppText>
        <AppText textColor xsm>
          {formattedDate} {task.est_minutes ? `· ${task.est_minutes} mins` : ''}
        </AppText>
      </AppView>
      {!readonly && (
        <AppButton
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}>
          <AppView reanimated style={iconStyles}>
            <AppIcon set="Feather" name={'arrow-right'} size={20} />
          </AppView>
        </AppButton>
      )}
    </AppView>
  );
};

export const MilestoneTaskItem = React.memo(
  MilestoneTaskItemComponent,
  (prevProps, nextProps) =>
    prevProps.task.task_id === nextProps.task.task_id &&
    prevProps.readonly === nextProps.readonly &&
    prevProps.task.status === nextProps.task.status,
);
