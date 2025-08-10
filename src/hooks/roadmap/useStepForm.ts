import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addStepAction,
  selectSelectedMilestone,
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
  stepNumber?: number;
  taskId?: string;
}

export const useStepForm = ({
  onSuccess,
  mode = 'create',
  stepDescription,
  stepNumber,
  taskId,
}: StepFormHookProps) => {
  const { t } = useLocalization();
  const schema = createStepValidationSchema(t);
  const dispatch = useAppDispatch();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const canEdit = mode === 'edit';

  const onStepSubmit = async ({ stepDescription }: StepSchemaType) => {
    if (selectedMilestone?.MilestoneId) {
      if (canEdit) {
        dispatch(
          updateStepAction({
            Description: stepDescription,
            Number: stepNumber || 0,
            TaskId: taskId,
          }),
        );
      } else {
        dispatch(addStepAction({ Description: stepDescription }));
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
    handleChange: handleChange<keyof StepSchemaType>,
    handleBlur: handleBlur<keyof StepSchemaType>,
    ...restFormikOptions,
  };
};
