import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { Link, router } from 'expo-router';
import { useState } from 'react';

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSuccessfullSignup = () => {
    router.replace('/(protected)/(tabs)');
  };

  return (
    <AppView marginV-40>
      <TranslatedTextInput
        labelKey="authentication.first_name"
        placeholderKey="authentication.first_name"
      />
      <TranslatedTextInput
        labelKey="authentication.last_name"
        placeholderKey="authentication.last_name"
      />
      <TranslatedTextInput
        labelKey="authentication.your_email"
        placeholderKey="authentication.email_placeholder"
      />
      <TranslatedTextInput
        labelKey="authentication.password"
        placeholderKey="authentication.password_placeholder"
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
      <SocialLogin onSuccessfullLogin={onSuccessfullSignup} />
    </AppView>
  );
};
