import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { AuthErrorType } from '@/hooks/auth/types/auth.types';
import { useResetPasswordForm } from '@/hooks/auth/useResetPasswordForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';
import React from 'react';

export const ResetPasswordForm = () => {
  const { showToast } = useToast();
  const { t } = useLocalization();

  const onError = (error: AuthErrorType) => {
    showToast({
      type: 'failure',
      message: error.message,
    });
  };

  const onSuccess = () => {
    showToast({
      type: 'success',
      message: t('authentication.password_updated'),
    });
    router.back();
  };

  const { isLoading, handleChange, handleBlur, handleSubmit, touched, errors } =
    useResetPasswordForm({
      onError,
      onSuccess,
    });
  return (
    <AppView flex marginV-40>
      <TranslatedTextInput
        labelKey="authentication.new_password"
        placeholderKey="authentication.password_placeholder"
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password && errors.password}
      />
      <PrimaryButton
        label="authentication.reset_password"
        onPress={handleSubmit}
        isLoading={isLoading}
        shouldShowLoader
      />
    </AppView>
  );
};
