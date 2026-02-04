import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { FeedbackCategoryType } from '@/store/apis/types/feedbackApi.types';
import * as Yup from 'yup';

export interface FeedbackFormValuesType {
  category: FeedbackCategoryType | '';
  message: string;
}

const createFeedbackValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    category: Yup.string()
      .oneOf(
        ['bug', 'feature', 'general'],
        t('app_feedback.validation.category_required'),
      )
      .required(t('app_feedback.validation.category_required')),
    message: Yup.string()
      .min(10, t('app_feedback.validation.message_min_length'))
      .required(t('app_feedback.validation.message_required')),
  });
};

export type FeedbackValidationSchemaType = ReturnType<
  typeof createFeedbackValidationSchema
>;

export const useFeedbackValidation = () => {
  const { t } = useLocalization();
  const schema = createFeedbackValidationSchema(t);
  return { schema };
};
