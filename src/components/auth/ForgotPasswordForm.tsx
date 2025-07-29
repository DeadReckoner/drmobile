import { AppRouterLink } from '@/components/AppLink';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { AuthErrorType } from '@/hooks/auth/types/auth.types';
import { useForgotPasswordForm } from '@/hooks/auth/useForgotPasswordForm';
import { useVerifyOTPForm } from '@/hooks/auth/useVerifyOTPForm';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';

export const ForgotPasswordForm = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const onError = (error: AuthErrorType) => {
    showToast({
      type: 'failure',
      message: error.message,
    });
  };

  const onSuccess = () => {
    setStep('otp');
  };

  const {
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    errors,
    values,
  } = useForgotPasswordForm({
    onError,
    onSuccess,
  });

  const {
    isLoading: isOTPLoading,
    handleChange: handleOTPChange,
    handleBlur: handleOTPBlur,
    handleSubmit: handleOTPSubmit,
    touched: otpTouched,
    errors: otpErrors,
  } = useVerifyOTPForm({
    email: values.email,
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
          editable={step === 'email'}
        />

        {step === 'otp' && (
          <TranslatedTextInput
            labelKey="authentication.your_otp"
            placeholderKey="authentication.otp_placeholder"
            onChangeText={handleOTPChange('otp')}
            onBlur={handleOTPBlur('otp')}
            error={otpTouched.otp && otpErrors.otp}
          />
        )}
        {step === 'email' ? (
          <PrimaryButton
            label="authentication.send_otp"
            onPress={handleSubmit}
            isLoading={isLoading}
            shouldShowLoader
          />
        ) : (
          <PrimaryButton
            label="authentication.login"
            onPress={handleOTPSubmit}
            isLoading={isOTPLoading}
            shouldShowLoader
          />
        )}
      </AppView>
      <AppView row center gap-8 marginB-40 marginT-24>
        <TranslatedText
          secondary
          translationKey="authentication.remember_password"
        />
        <AppRouterLink
          dismissTo
          href="/login"
          translationKey="authentication.login"
        />
      </AppView>
    </AppView>
  );
};
