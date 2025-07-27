import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { AuthErrorType } from '@/hooks/auth/types/auth.types';
import { useResetPasswordForm } from '@/hooks/auth/useResetPasswordForm';
import { useToast } from '@/hooks/useToast';
import { Link } from 'expo-router';
import React from 'react';

export const ForgotPasswordForm = () => {
  const { showToast } = useToast();

  const onError = (error: AuthErrorType) => {
    showToast({
      type: 'failure',
      message: error.message,
    });
  };

  const { isLoading, handleChange, handleBlur, handleSubmit, touched, errors } =
    useResetPasswordForm({
      onError,
    });
  return (
    <AppView flex marginV-40 spread>
      <AppView>
        <TranslatedTextInput
          labelKey="authentication.your_email"
          placeholderKey="authentication.email_placeholder"
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          error={touched.email && errors.email}
        />
        <PrimaryButton
          label="authentication.reset_password"
          onPress={handleSubmit}
          isLoading={isLoading}
          shouldShowLoader
        />
      </AppView>
      <AppView row center gap-8 marginB-40 marginT-24>
        <TranslatedText
          secondary
          translationKey="authentication.remember_password"
        />
        <Link dismissTo href="/login">
          <TranslatedText translationKey="authentication.login" />
        </Link>
      </AppView>
    </AppView>
  );
};
