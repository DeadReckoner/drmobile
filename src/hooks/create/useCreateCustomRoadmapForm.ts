import { FormRoadmapType } from '@/hooks/create/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { DateUtils } from '@/utils/date.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createCustomRoadmapValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    goal: Yup.string()
      .min(2, t('tabs.create_tab.errors.goal_name_invalid'))
      .required(t('tabs.create_tab.errors.goal_desc_required')),
    goalDescription: Yup.string()
      .min(2, t('tabs.create_tab.errors.goal_desc_required'))
      .required(t('tabs.create_tab.errors.goal_desc_required')),
    reason: Yup.string()
      .min(2, t('tabs.create_tab.errors.goal_reason_invalid'))
      .required(t('tabs.create_tab.errors.goal_reason_required')),
    targetDate: Yup.string()
      .min(2, t('tabs.create_tab.errors.goal_date_invalid'))
      .required(t('tabs.create_tab.errors.goal_date_required')),
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
