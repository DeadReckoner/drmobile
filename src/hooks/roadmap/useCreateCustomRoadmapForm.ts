import type { FormRoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { DateUtils } from '@/utils/date.utils';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createCustomRoadmapValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const goal = t('tabs.create_tab.goal_name_label');
  const goalDescription = t('tabs.create_tab.goal_description_label');
  const reason = t('authentication.your_email');
  const targetDate = t('authentication.password');
  return Yup.object({
    goal: Yup.string()
      .label(goal)
      .min(2, isInvalidMessage(goal, t))
      .required(isRequiredMessage(goal, t)),
    goalDescription: Yup.string()
      .label(goalDescription)
      .min(2, isInvalidMessage(goalDescription, t))
      .required(isRequiredMessage(goalDescription, t)),
    reason: Yup.string()
      .label(reason)
      .min(2, isInvalidMessage(reason, t))
      .required(isRequiredMessage(reason, t)),
    targetDate: Yup.string()
      .label(targetDate)
      .min(2, isInvalidMessage(targetDate, t))
      .required(isRequiredMessage(targetDate, t)),
  });
};

type CustomRoadmapSchemaType = Yup.InferType<
  ReturnType<typeof createCustomRoadmapValidationSchema>
>;

interface CustomRoadmapFormHookProps {
  onSuccess?: (_roadmap: FormRoadmapType) => void;
}

export const useCreateCustomRoadmapForm = ({
  onSuccess,
}: CustomRoadmapFormHookProps) => {
  const { t } = useLocalization();
  const schema = createCustomRoadmapValidationSchema(t);

  const onCustomRoadmapSubmit = async ({
    goal,
    goalDescription,
    targetDate,
    reason,
  }: CustomRoadmapSchemaType) => {
    onSuccess?.({
      Goal: goal,
      Description: goalDescription,
      Reason: reason,
      Days: DateUtils.daysBetween(DateUtils.createDate(), targetDate),
    });
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<CustomRoadmapSchemaType>({
      initialValues: {
        goal: '',
        goalDescription: '',
        reason: '',
        targetDate: '',
      },
      validationSchema: schema,
      onSubmit: onCustomRoadmapSubmit,
    });

  return {
    handleChange: handleChange<keyof CustomRoadmapSchemaType>,
    handleBlur: handleBlur<keyof CustomRoadmapSchemaType>,
    ...restFormikOptions,
  };
};
