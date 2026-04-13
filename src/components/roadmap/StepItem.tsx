import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import {
  FormEditModeType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useUpdateStepMutation } from '@/hooks/step';
import { useToast } from '@/hooks/useToast';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftSlice,
  selectSelectedTask,
  setSelectedTaskAction,
  updateStepAction,
  updateStepByIdAction,
} from '@/store/slices/roadmapDraftSlice';
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
  index: number;
  onStepPress: (_step: StepType) => void;
  mode?: FormEditModeType;
}

export const StepItem = ({ step, index, onStepPress, mode }: StepItemProps) => {
  const scale = useSharedValue(1);
  const [updateStep, { isLoading: isUpdating }] = useUpdateStepMutation();
  const task = useAppSelector(selectSelectedTask);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
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
        // Optimistic update: always patch the step in the roadmap tree by ID
        dispatch(
          updateStepByIdAction({ step_id: step.step_id, completed: value }),
        );
        // Additionally sync the selected-task slice when a task is selected
        if (task) {
          dispatch(updateStepAction({ completed: value, index }));
          const updatedTask = {
            ...task,
            steps:
              task.steps.map((s, i) =>
                i === index ? { ...s, completed: value } : s,
              ) || [],
          } as TaskType;
          dispatch(setSelectedTaskAction({ task: updatedTask }));
        }

        await updateStep({
          description: step.description,
          number: step.number,
          step_id: step.step_id,
          task_id: step.task_id,
          completed: value,
        }).unwrap();

        // Refetch the full single-roadmap data so TodayTab (and any other
        // consumer) receives rich nested data (phases→milestones→tasks→steps).
        // Using getRoadmapById avoids overwriting the store with the sparse
        // list-endpoint payload that getRoadmaps returns.
        const roadmapId = selectedDraft.roadmap?.roadmap_id;
        if (roadmapId) {
          dispatch(
            roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
              forceRefetch: true,
            }),
          );
        }
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    } else {
      dispatch(updateStepAction({ completed: value, index }));
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
              disabled={mode === 'readonly'}
              value={step.completed}
              onValueChange={handleCompleteStep}
            />
          )}
        </AppView>
        <AppText textColor body2 flex>
          {step.description}
        </AppText>
        {mode !== 'view' && mode !== 'readonly' && (
          <AppButton
            onPress={() => onStepPress(step)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            <AppView reanimated style={iconStyles}>
              <AppIcon set="Feather" name={'arrow-right'} size={20} />
            </AppView>
          </AppButton>
        )}
      </AppView>
    </>
  );
};
