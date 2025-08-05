import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { addMilestoneAction } from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createMilestoneValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const nameLabel = t('tabs.create_tab.milestone_name_label');
  const descLabel = t('tabs.create_tab.milestone_desc_label');
  return Yup.object({
    milestoneName: Yup.string()
      .label(nameLabel)
      .min(2, isInvalidMessage(nameLabel, t))
      .required(isRequiredMessage(nameLabel, t)),
    milestoneDescription: Yup.string()
      .label(descLabel)
      .min(2, isInvalidMessage(descLabel, t))
      .required(isRequiredMessage(descLabel, t)),
  });
};

type MilestoneSchemaType = Yup.InferType<
  ReturnType<typeof createMilestoneValidationSchema>
>;

interface MilestoneFormHookProps {
  onSuccess?: () => void;
}

export const useMilestoneForm = ({ onSuccess }: MilestoneFormHookProps) => {
  const { t } = useLocalization();
  const schema = createMilestoneValidationSchema(t);
  const dispatch = useAppDispatch();

  const onMilestoneSubmit = async ({
    milestoneName,
    milestoneDescription,
  }: MilestoneSchemaType) => {
    dispatch(
      addMilestoneAction({
        Day: 0,
        Description: milestoneDescription,
        Reached: false,
        SubGoal: milestoneName,
      }),
    );
    onSuccess?.();
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<MilestoneSchemaType>({
      initialValues: { milestoneName: '', milestoneDescription: '' },
      validationSchema: schema,
      onSubmit: onMilestoneSubmit,
    });

  return {
    handleChange: handleChange<keyof MilestoneSchemaType>,
    handleBlur: handleBlur<keyof MilestoneSchemaType>,
    ...restFormikOptions,
  };
};
