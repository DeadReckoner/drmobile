import { AppRouterLink } from '@/components/AppLink';
import { AppScreen } from '@/components/AppScreen';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';

const ForgotPassword = () => {
  return (
    <AppScreen>
      <AppView flex paddingT-60>
        <ScreenHeader
          title="authentication.forgot_password"
          subtitle="authentication.forgot_password_subtitle"
        />
        <ForgotPasswordForm />
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
    </AppScreen>
  );
};

export default ForgotPassword;
