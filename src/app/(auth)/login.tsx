import { AppScreen } from '@/components/AppScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Link } from 'expo-router';

const Login = () => {
  return (
    <AppScreen spread paddingT-60 paddingB-70>
      <ScreenHeader
        title="authentication.login"
        subtitle="authentication.login_subtitle"
      />
      <LoginForm />
      <AppView row center gap-8>
        <TranslatedText
          secondary
          translationKey="authentication.dont_have_an_account"
        />
        <Link href="/(auth)/sign-up">
          <TranslatedText textColor translationKey="authentication.sign_up" />
        </Link>
      </AppView>
    </AppScreen>
  );
};

export default Login;
