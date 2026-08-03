import { StepRow } from '@/components/StepRow';
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

interface StepItemProps {
  step: StepType;
  index: number;
  onStepPress: (_step: StepType) => void;
  mode?: FormEditModeType;
}

export const StepItem = ({ step, index, onStepPress, mode }: StepItemProps) => {
  const [updateStep, { isLoading: isUpdating }] = useUpdateStepMutation();
  const task = useAppSelector(selectSelectedTask);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

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
    <StepRow
      description={step.description}
      completed={step.completed}
      isUpdating={isUpdating}
      disabled={mode === 'readonly'}
      onToggle={handleCompleteStep}
      onEditPress={
        mode !== 'view' && mode !== 'readonly'
          ? () => onStepPress(step)
          : undefined
      }
    />
  );
};
