import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useCreateStepMutation, useUpdateStepMutation } from '@/hooks/step';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addStepAction,
  selectDraftSlice,
  selectSelectedStep,
  selectSelectedTask,
  updateStepAction,
} from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createStepValidationSchema = (t: (_: TranslationKeysType) => string) => {
  const nameLabel = t('tabs.create_tab.step_label');
  return Yup.object({
    stepDescription: Yup.string()
      .label(nameLabel)
      .min(2, isInvalidMessage(nameLabel, t))
      .required(isRequiredMessage(nameLabel, t)),
  });
};

type StepSchemaType = Yup.InferType<
  ReturnType<typeof createStepValidationSchema>
>;

interface StepFormHookProps {
  mode?: FormEditModeType;
  stepDescription?: string;
  onSuccess?: () => void;
  onError?: (_error: unknown) => void;
  taskId?: string;
}

export const useStepForm = ({
  onSuccess,
  mode = 'create',
  stepDescription,
  taskId,
  onError,
}: StepFormHookProps) => {
  const { t } = useLocalization();
  const schema = createStepValidationSchema(t);
  const dispatch = useAppDispatch();
  const selectedTask = useAppSelector(selectSelectedTask);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const selectedStep = useAppSelector(selectSelectedStep);
  const [createStep, { isLoading: isCreatingStep }] = useCreateStepMutation();
  const [updateStep, { isLoading: isUpdatingStep }] = useUpdateStepMutation();
  const canEdit = mode === 'edit';

  const onStepSubmit = async ({ stepDescription }: StepSchemaType) => {
    if (selectedDraft?.shouldSyncWithServer) {
      try {
        if (selectedTask?.task_id && selectedStep?.step_id && canEdit) {
          await updateStep({
            ...selectedStep,
            description: stepDescription,
            task_id: selectedTask.task_id,
            step_id: selectedStep.step_id,
            completed: selectedStep.completed,
            number: selectedStep.number,
          }).unwrap();
          onSuccess?.();
        } else if (selectedTask?.task_id && !canEdit) {
          await createStep({
            description: stepDescription,
            task_id: selectedTask.task_id,
            number: selectedTask.steps.length + 1,
            completed: false,
          }).unwrap();
          onSuccess?.();
        }
      } catch (error) {
        onError?.(error);
      }
    } else {
      if (canEdit) {
        dispatch(
          updateStepAction({
            description: stepDescription,
            number: selectedStep?.number || 0,
            task_id: taskId,
          }),
        );
      } else {
        dispatch(addStepAction({ description: stepDescription }));
      }
      onSuccess?.();
    }
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<StepSchemaType>({
      initialValues: {
        stepDescription: stepDescription || '',
      },
      validationSchema: schema,
      onSubmit: onStepSubmit,
    });

  return {
    isLoading: isCreatingStep || isUpdatingStep,
    handleChange: handleChange<keyof StepSchemaType>,
    handleBlur: handleBlur<keyof StepSchemaType>,
    ...restFormikOptions,
  };
};
