import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import dayjs from 'dayjs';
import React from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface MilestoneTaskItemProps {
  task: TaskType;
  onPress: (_task: TaskType) => void;
}

export const MilestoneTaskItem = ({
  task,
  onPress,
}: MilestoneTaskItemProps) => {
  const scale = useSharedValue(1);
  const iconStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withSequence(withSpring(0.7), withSpring(1.2));
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };
  return (
    <AppView row paddingL-32 paddingV-16 paddingR-18 gap-16 center>
      <AppCheckbox value={task.steps.every((step) => step.completed)} />
      <AppView flex>
        <AppText flex textColor body2>
          {task.title}
        </AppText>
        <AppText textColor xsm>
          {dayjs(task.date).format('MM/DD/YYYY')}{' '}
          {task.est_minutes ? `· ${task.est_minutes} mins` : ''}
        </AppText>
      </AppView>
      <AppButton
        onPress={() => onPress(task)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <AppView reanimated style={iconStyles}>
          <AppIcon set="Feather" name={'arrow-right'} size={20} />
        </AppView>
      </AppButton>
    </AppView>
  );
};
