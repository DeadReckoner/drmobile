import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useSignupForm } from '@/hooks/auth/useSignupForm';
import { Link } from 'expo-router';
import { useState } from 'react';

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleChange, handleBlur, touched, errors } = useSignupForm({
    onSubmit: () => {},
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
