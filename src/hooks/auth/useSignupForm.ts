import {
  AuthErrorType,
  SessionLessUserType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useFormik } from 'formik';
import { useState } from 'react';
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
  onSuccess?: (_user: SessionLessUserType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useSignupForm = (pros: SignupFormHookProps) => {
  const { onSuccess, onError } = pros;
  const { t } = useLocalization();
  const schema = createSignupValidationSchema(t);

  const { signUpEmailWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onSignupSubmit = async ({ email, password }: SignupSchemaType) => {
    setIsLoading(true);

    const { data, error } = await signUpEmailWithAuthProvider(email, password);
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<SignupSchemaType>({
      initialValues: { email: '', password: '', firstName: '', lastName: '' },
      validationSchema: schema,
      onSubmit: onSignupSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof SignupSchemaType>,
    handleBlur: handleBlur<keyof SignupSchemaType>,
    ...restFormikOptions,
  };
};
