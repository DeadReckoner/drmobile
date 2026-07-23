import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import {
  FormEditModeType,
  StepStatusType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useUpdateStepMutation } from '@/hooks/step';
import { useLocalization } from '@/hooks/useLocalization';
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
import React, { useState } from 'react';
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

const getStepStatus = (step: StepType): StepStatusType => {
  if (step.status) return step.status;
  return step.completed ? 'completed' : 'incomplete';
};

export const StepItem = ({ step, index, onStepPress, mode }: StepItemProps) => {
  const scale = useSharedValue(1);
  const [updateStep, { isLoading: isUpdating }] = useUpdateStepMutation({
    fixedCacheKey: `update-step-${step.step_id}`,
  });
  const task = useAppSelector(selectSelectedTask);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const iconStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withSequence(withSpring(0.7), withSpring(1.2));
  };
  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const isStepCompleted = (s: StepType) =>
    s.status === 'completed' || s.completed || s.status === 'skipped';

  const applyStepStatusUpdate = (
    completed: boolean,
    newStatus: StepStatusType,
  ) => {
    dispatch(
      updateStepByIdAction({
        step_id: step.step_id,
        completed,
        status: newStatus,
      }),
    );
    if (task) {
      dispatch(updateStepAction({ completed, status: newStatus, index }));
      const updatedSteps = task.steps.map((s, i) =>
        i === index ? { ...s, completed, status: newStatus } : s,
      );
      const allDone =
        updatedSteps.length > 0 && updatedSteps.every(isStepCompleted);
      const updatedTask: TaskType = {
        ...task,
        steps: updatedSteps,
        status: allDone
          ? 'completed'
          : task.status === 'completed'
            ? 'in_progress'
            : task.status,
      };
      dispatch(setSelectedTaskAction({ task: updatedTask }));
    }
  };

  const refetchRoadmap = () => {
    const roadmapId = selectedDraft.roadmap?.roadmap_id;
    if (roadmapId) {
      dispatch(
        roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
          forceRefetch: true,
        }),
      );
    }
  };

  const handleCompleteStep = async (value: boolean) => {
    const newStatus: StepStatusType = value ? 'completed' : 'incomplete';
    if (selectedDraft.shouldSyncWithServer && step.step_id) {
      try {
        applyStepStatusUpdate(value, newStatus);
        await updateStep({
          description: step.description,
          number: step.number,
          step_id: step.step_id,
          task_id: step.task_id,
          completed: value,
          status: newStatus,
        }).unwrap();
        refetchRoadmap();
      } catch (error) {
        showToast({ type: 'failure', message: getApiErrorMessage(error) });
      }
    } else {
      dispatch(
        updateStepAction({ completed: value, status: newStatus, index }),
      );
    }
  };

  const handleUpdateStatus = async (newStatus: StepStatusType) => {
    setIsSheetVisible(false);
    const completed = newStatus === 'completed';
    if (selectedDraft.shouldSyncWithServer && step.step_id) {
      try {
        applyStepStatusUpdate(completed, newStatus);
        await updateStep({
          step_id: step.step_id,
          task_id: step.task_id,
          status: newStatus,
          completed,
        }).unwrap();
        refetchRoadmap();
      } catch (error) {
        showToast({ type: 'failure', message: getApiErrorMessage(error) });
      }
    } else {
      dispatch(updateStepAction({ completed, status: newStatus, index }));
    }
  };

  const currentStatus = getStepStatus(step);

  const sheetOptions =
    currentStatus === 'skipped' || currentStatus === 'completed'
      ? [
          {
            label: t('step.mark_incomplete'),
            icon: <AppIcon set="Feather" name="rotate-ccw" size={18} />,
            onPress: () => handleUpdateStatus('incomplete'),
          },
        ]
      : [
          {
            label: t('step.skip'),
            icon: <AppIcon set="Feather" name="minus-circle" size={18} />,
            onPress: () => handleUpdateStatus('skipped'),
          },
        ];

  return (
    <>
      <AppView row padding-16 gap-16 center br30>
        <AppView>
          {isUpdating ? (
            <AppView width={24} height={24} center>
              <ActivityIndicator />
            </AppView>
          ) : (
            <>
              {step.status === 'skipped' ? (
                <AppView width={24} height={24} center bg-primary br10>
                  <AppView br20 height={2} width={'60%'} bg-textColor />
                </AppView>
              ) : (
                <AppCheckbox
                  disabled={mode === 'readonly'}
                  value={step.status === 'completed' || step.completed}
                  onValueChange={handleCompleteStep}
                />
              )}
            </>
          )}
        </AppView>
        <AppButton
          flex
          onPress={() => {
            if (mode !== 'readonly') setIsSheetVisible(true);
          }}
          disabled={mode === 'readonly'}>
          <AppText
            textColor={currentStatus !== 'skipped'}
            body2
            style={[
              currentStatus === 'completed' && {
                textDecorationLine: 'line-through',
              },
              currentStatus === 'skipped' && {
                textDecorationLine: 'line-through',
                fontStyle: 'italic',
                color: 'grey',
              },
            ]}>
            {step.description}
          </AppText>
        </AppButton>
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
      <AppActionSheetModal
        title={t('step.status_options')}
        visible={isSheetVisible}
        onDismiss={() => setIsSheetVisible(false)}
        options={sheetOptions}
      />
    </>
  );
};
