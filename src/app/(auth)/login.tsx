import { AppScreen } from '@/components/AppScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ScreenHeader } from '@/components/ScreenHeader';

const Login = () => {
  return (
    <AppScreen spread paddingT-60>
      <ScreenHeader
        title="authentication.login"
        subtitle="authentication.login_subtitle"
      />
      <LoginForm />
    </AppScreen>
  );
};

export default Login;
