import { AuthErrorType, UserType } from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createLoginValidationSchema = (t: (_: TranslationKeysType) => string) => {
  const email = t('authentication.your_email');
  const password = t('authentication.password');
  return Yup.object({
    email: Yup.string()
      .label(email)
      .matches(VALIDATION_RULES.email, isInvalidMessage(email, t))
      .required(isRequiredMessage(email, t)),
    password: Yup.string()
      .label(password)
      .matches(
        VALIDATION_RULES.password,
        t('authentication.errors.email.password_complexity'),
      )
      .required(isRequiredMessage(password, t)),
  });
};

type LoginSchemaType = Yup.InferType<
  ReturnType<typeof createLoginValidationSchema>
>;

interface LoginFormHookProps {
  onSuccess?: (_user: UserType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useLoginForm = ({ onSuccess, onError }: LoginFormHookProps) => {
  const { t } = useLocalization();
  const schema = createLoginValidationSchema(t);
  const { signInEmailWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onLoginSubmit = async ({ email, password }: LoginSchemaType) => {
    setIsLoading(true);

    const { data, error } = await signInEmailWithAuthProvider(email, password);
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<LoginSchemaType>({
      initialValues: { email: '', password: '' },
      validationSchema: schema,
      onSubmit: onLoginSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof LoginSchemaType>,
    handleBlur: handleBlur<keyof LoginSchemaType>,
    ...restFormikOptions,
  };
};
