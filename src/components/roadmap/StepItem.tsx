import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { StepType } from '@/hooks/roadmap/types/roadmap.types';
import { useUpdateStepMutation } from '@/hooks/step';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftSlice } from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface StepItemProps {
  step: StepType;
  onCompleteStep: (_value: boolean) => void;
  onStepPress: (_step: StepType) => void;
}

export const StepItem = ({
  step,
  onCompleteStep,
  onStepPress,
}: StepItemProps) => {
  const scale = useSharedValue(1);
  const [updateStep, { isLoading: isUpdating }] = useUpdateStepMutation();
  const selectedDraft = useAppSelector(selectDraftSlice);
  const { showToast } = useToast();
  const iconStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withSequence(withSpring(0.7), withSpring(1.2));
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const handleCompleteStep = async (value: boolean) => {
    if (selectedDraft.shouldSyncWithServer && step.step_id) {
      try {
        await updateStep({
          description: step.description,
          number: step.number,
          step_id: step.step_id,
          task_id: step.task_id,
          completed: value,
        }).unwrap();
        onCompleteStep(value);
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    } else {
      onCompleteStep(value);
    }
  };
  return (
    <>
      <AppView row padding-16 gap-16 center br30>
        <AppView>
          {isUpdating ? (
            <AppView width={24} height={24} center>
              <ActivityIndicator />
            </AppView>
          ) : (
            <AppCheckbox
              value={step.completed}
              onValueChange={handleCompleteStep}
            />
          )}
        </AppView>
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
    </>
  );
};
