import { AppRouterLink } from '@/components/AppLink';
import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { AuthErrorType } from '@/hooks/auth/types/auth.types';
import { useLoginForm } from '@/hooks/auth/useLoginForm';
import { useToast } from '@/hooks/useToast';

export const LoginForm = () => {
  const { showToast } = useToast();

  const onError = (error: AuthErrorType) => {
    showToast({
      type: 'failure',
      message: error.message,
    });
  };

  const { isLoading, handleChange, handleBlur, handleSubmit, touched, errors } =
    useLoginForm({
      onError,
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
        <AppRouterLink
          href="/forgot-password"
          translationKey="authentication.forgot_password"
        />
      </AppView>
      <Divider margin-16 />
      <PrimaryButton
        shouldShowLoader
        label="authentication.login"
        onPress={handleSubmit}
        isLoading={isLoading}
      />
      <OrDivider />
      <SocialLogin />
    </AppView>
  );
};
