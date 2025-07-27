import {
  AuthErrorType,
  SentMailResponseType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createResetPasswordValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    email: Yup.string()
      .label(t('authentication.your_email'))
      .email(t('authentication.errors.email.email_invalid'))
      .required(t('authentication.errors.email.email_required')),
  });
};

type ResetPasswordSchemaType = Yup.InferType<
  ReturnType<typeof createResetPasswordValidationSchema>
>;

interface ResetPasswordFormHookProps {
  onSuccess?: (_mailResponse: SentMailResponseType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useResetPasswordForm = ({
  onSuccess,
  onError,
}: ResetPasswordFormHookProps) => {
  const { t } = useLocalization();
  const schema = createResetPasswordValidationSchema(t);
  const { resetPasswordWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onResetPasswordSubmit = async ({ email }: ResetPasswordSchemaType) => {
    setIsLoading(true);

    const { data, error } = await resetPasswordWithAuthProvider(email);
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<ResetPasswordSchemaType>({
      initialValues: { email: '' },
      validationSchema: schema,
      onSubmit: onResetPasswordSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof ResetPasswordSchemaType>,
    handleBlur: handleBlur<keyof ResetPasswordSchemaType>,
    ...restFormikOptions,
  };
};
