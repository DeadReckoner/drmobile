import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createSignupValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    firstName: Yup.string()
      .label(t('authentication.first_name'))
      .min(2, t('authentication.errors.email.name_invalid'))
      .required(t('authentication.errors.email.name_required')),
    lastName: Yup.string()
      .label(t('authentication.last_name'))
      .min(2, t('authentication.errors.email.name_invalid'))
      .required(t('authentication.errors.email.name_required')),
    email: Yup.string()
      .label(t('authentication.your_email'))
      .email(t('authentication.errors.email.email_invalid'))
      .required(t('authentication.errors.email.email_required')),
    password: Yup.string()
      .label(t('authentication.password'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        t('authentication.errors.email.password_complexity'),
      )
      .required(t('authentication.errors.email.password_required')),
  });
};

type SignupSchemaType = Yup.InferType<
  ReturnType<typeof createSignupValidationSchema>
>;

interface SignupFormHookProps {
  onSubmit: (_values: SignupSchemaType) => void;
}

export const useSignupForm = ({ onSubmit }: SignupFormHookProps) => {
  const { t } = useLocalization();
  const schema = createSignupValidationSchema(t);

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<SignupSchemaType>({
      initialValues: { email: '', password: '', firstName: '', lastName: '' },
      validationSchema: schema,
      onSubmit,
    });

  return {
    handleChange: handleChange<keyof SignupSchemaType>,
    handleBlur: handleBlur<keyof SignupSchemaType>,
    ...restFormikOptions,
  };
};
