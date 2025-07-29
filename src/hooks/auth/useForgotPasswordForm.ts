import {
  AuthErrorType,
  SentMailResponseType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createForgotPasswordValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    email: Yup.string()
      .label(t('authentication.your_email'))
      .matches(
        VALIDATION_RULES.email,
        t('authentication.errors.email.email_invalid'),
      )
      .required(t('authentication.errors.email.email_required')),
  });
};

type ForgotPasswordSchemaType = Yup.InferType<
  ReturnType<typeof createForgotPasswordValidationSchema>
>;

interface ForgotPasswordFormHookProps {
  onSuccess?: (_mailResponse: SentMailResponseType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useForgotPasswordForm = ({
  onSuccess,
  onError,
}: ForgotPasswordFormHookProps) => {
  const { t } = useLocalization();
  const schema = createForgotPasswordValidationSchema(t);
  const { sendOTPViaEmailWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onForgotPasswordSubmit = async ({
    email,
  }: ForgotPasswordSchemaType) => {
    setIsLoading(true);

    const { data, error } = await sendOTPViaEmailWithAuthProvider(email);
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<ForgotPasswordSchemaType>({
      initialValues: { email: 'code.abhishekmalaviya@gmail.com' },
      validationSchema: schema,
      onSubmit: onForgotPasswordSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof ForgotPasswordSchemaType>,
    handleBlur: handleBlur<keyof ForgotPasswordSchemaType>,
    ...restFormikOptions,
  };
};
