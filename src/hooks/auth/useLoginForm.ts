import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createLoginValidationSchema = (t: (_: TranslationKeysType) => string) => {
  return Yup.object({
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

type LoginSchemaType = Yup.InferType<
  ReturnType<typeof createLoginValidationSchema>
>;

interface LoginFormHookProps {
  onSubmit: (_values: LoginSchemaType) => void;
}

export const useLoginForm = ({ onSubmit }: LoginFormHookProps) => {
  const { t } = useLocalization();
  const schema = createLoginValidationSchema(t);

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<LoginSchemaType>({
      initialValues: { email: '', password: '' },
      validationSchema: schema,
      onSubmit,
    });

  return {
    handleChange: handleChange<keyof LoginSchemaType>,
    handleBlur: handleBlur<keyof LoginSchemaType>,
    ...restFormikOptions,
  };
};
