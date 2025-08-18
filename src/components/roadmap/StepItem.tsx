import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { StepType } from '@/hooks/roadmap/types/roadmap.types';
import React from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface StepItemProps {
  step: StepType;
  onCompleteStep: (_value: boolean, _step: StepType) => void;
  onStepPress: (_step: StepType) => void;
}

export const StepItem = ({
  step,
  onCompleteStep,
  onStepPress,
}: StepItemProps) => {
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
    <AppView row padding-16 gap-16 center>
      <AppCheckbox
        value={step.completed}
        onValueChange={(value) => onCompleteStep(value, step)}
      />
      <AppText textColor body2 flex>
        {step.description}
      </AppText>
      <AppButton
        onPress={() => onStepPress(step)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <AppView reanimated style={iconStyles}>
          <AppIcon set="Feather" name={'arrow-right'} size={20} />
        </AppView>
      </AppButton>
    </AppView>
  );
};
