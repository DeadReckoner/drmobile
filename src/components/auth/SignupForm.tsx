import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import {
  AuthErrorType,
  SessionLessUserType,
} from '@/hooks/auth/types/auth.types';
import { useSignupForm } from '@/hooks/auth/useSignupForm';
import { useToast } from '@/hooks/useToast';
import { Link, router } from 'expo-router';
import { useState } from 'react';

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const onSuccess = (user: SessionLessUserType) => {
    if (!user?.access_token) {
      router.replace('/check-email');
    }
  };

  const onError = (error: AuthErrorType) => {
    showToast({
      type: 'failure',
      message: error.message,
    });
  };
  const { handleChange, handleBlur, touched, errors } = useSignupForm({
    onSuccess,
    onError,
  });

  return (
    <AppView marginV-40>
      <TranslatedTextInput
        labelKey="authentication.first_name"
        placeholderKey="authentication.first_name"
        onChangeText={handleChange('firstName')}
        onBlur={handleBlur('firstName')}
        error={touched.firstName && errors.firstName}
      />
      <TranslatedTextInput
        labelKey="authentication.last_name"
        placeholderKey="authentication.last_name"
        onChangeText={handleChange('lastName')}
        onBlur={handleBlur('lastName')}
        error={touched.lastName && errors.lastName}
      />
      <TranslatedTextInput
        labelKey="authentication.your_email"
        placeholderKey="authentication.email_placeholder"
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email && errors.email}
      />
      <TranslatedTextInput
        labelKey="authentication.password"
        placeholderKey="authentication.password_placeholder"
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password && errors.password}
      />
      <AppView right>
        <Link href="/(auth)/sign-up" asChild>
          <TranslatedText translationKey="authentication.forgot_password" />
        </Link>
      </AppView>
      <Divider />
      <PrimaryButton
        shouldShowLoader
        label="authentication.sign_up"
        onPress={() => {
          setIsLoading((isLoading) => !isLoading);
        }}
        isLoading={isLoading}
      />
      <OrDivider />
      <SocialLogin />
    </AppView>
  );
};
