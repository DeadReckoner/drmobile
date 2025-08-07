import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
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
    <AppButton
      onPress={() => onPress(task)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <AppView row paddingL-32 paddingV-16 paddingR-18 gap-16 center>
        <AppCheckbox
          bg-primary
          borderRadius={4}
          containerStyle={{ borderWidth: 0 }}
          value={task.Completed}
        />
        <AppText flex textColor body2>
          {task.Title}
        </AppText>
        <AppView reanimated style={iconStyles}>
          <AppIcon set="Feather" name={'arrow-right'} size={20} />
        </AppView>
      </AppView>
    </AppButton>
  );
};
