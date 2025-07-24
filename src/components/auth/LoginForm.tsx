import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSuccessfullLogin = () => {
    router.replace('/(protected)/(tabs)');
  };

  return (
    <KeyboardAwareScrollView>
      <AppView>
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
          label="authentication.login"
          onPress={() => {
            setIsLoading((isLoading) => !isLoading);
          }}
          isLoading={isLoading}
        />
        <OrDivider />
        <SocialLogin onSuccessfullLogin={onSuccessfullLogin} />
      </AppView>
    </KeyboardAwareScrollView>
  );
};
