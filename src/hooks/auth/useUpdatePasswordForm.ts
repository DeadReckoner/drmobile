import {
  AuthErrorType,
  SessionLessUserType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createResetPasswordValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  return Yup.object({
    password: Yup.string()
      .label(t('authentication.new_password'))
      .matches(
        VALIDATION_RULES.password,
        t('authentication.errors.email.password_complexity'),
      )
      .required(t('authentication.errors.email.password_required')),
  });
};

type ResetPasswordSchemaType = Yup.InferType<
  ReturnType<typeof createResetPasswordValidationSchema>
>;

interface UpdatePasswordFormHookProps {
  onSuccess?: (_user: SessionLessUserType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useUpdatePasswordForm = ({
  onSuccess,
  onError,
}: UpdatePasswordFormHookProps) => {
  const { t } = useLocalization();

  const schema = createResetPasswordValidationSchema(t);
  const { updateUserWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onResetPasswordSubmit = async ({
    password,
  }: ResetPasswordSchemaType) => {
    setIsLoading(true);

    const { error, data } = await updateUserWithAuthProvider({ password });
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<ResetPasswordSchemaType>({
      initialValues: { password: '' },
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
