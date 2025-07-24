import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useLoginForm } from '@/hooks/auth/useLoginForm';
import { Link } from 'expo-router';
import { useState } from 'react';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { handleChange, handleBlur, touched, errors } = useLoginForm({
    onSubmit: () => {},
  });

  return (
    <AppView marginV-40>
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
        label="authentication.login"
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
