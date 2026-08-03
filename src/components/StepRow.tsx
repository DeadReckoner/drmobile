import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface StepRowProps {
  description: string;
  completed: boolean;
  /** Shows a spinner in place of the checkbox while a toggle is in flight. */
  isUpdating?: boolean;
  /** Checkbox is inert when omitted (read-only contexts). */
  onToggle?: (_value: boolean) => void;
  disabled?: boolean;
  /** Renders the trailing chevron. Omit to hide the edit affordance. */
  onEditPress?: () => void;
}

/**
 * The shared presentation of one step: checkbox, label, optional edit chevron.
 *
 * Extracted from the roadmap StepItem so recurring habits/tasks render steps in
 * exactly the same visual language rather than growing a second, divergent
 * checklist style. All behaviour stays with the callers -- StepItem keeps the
 * roadmap draft-slice wiring, HabitStepItem keeps the per-occurrence wiring --
 * so this component is purely presentational and shared safely by both.
 */
export const StepRow = ({
  description,
  completed,
  isUpdating,
  onToggle,
  disabled,
  onEditPress,
}: StepRowProps) => {
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
    <AppView row padding-16 gap-16 center br30>
      <AppView>
        {isUpdating ? (
          <AppView width={24} height={24} center>
            <ActivityIndicator />
          </AppView>
        ) : (
          <AppCheckbox
            disabled={disabled || !onToggle}
            value={completed}
            onValueChange={onToggle}
          />
        )}
      </AppView>
      <AppText textColor body2 flex>
        {description}
      </AppText>
      {onEditPress && (
        <AppButton
          onPress={onEditPress}
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
