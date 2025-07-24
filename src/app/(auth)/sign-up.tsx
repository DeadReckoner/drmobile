import { AppScreen } from '@/components/AppScreen';
import { SignupForm } from '@/components/auth/SignupForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Link } from 'expo-router';

const SignUp = () => {
  return (
    <AppScreen spread paddingT-60 paddingB-70>
      <ScreenHeader
        title="authentication.sign_up"
        subtitle="authentication.signup_subtitle"
      />
      <SignupForm />
      <AppView row center gap-8>
        <TranslatedText
          secondary
          translationKey="authentication.already_have_an_account"
        />
        <Link dismissTo href="/(auth)/login">
          <TranslatedText textColor translationKey="authentication.login" />
        </Link>
      </AppView>
    </AppScreen>
  );
};

export default SignUp;
