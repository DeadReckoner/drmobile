import { AppScreen } from '@/components/AppScreen';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppView } from '@/components/ui';

const ResetPassword = () => {
  return (
    <AppScreen safeArea>
      <AppView flex>
        <ScreenHeader
          title="authentication.reset_password"
          subtitle="authentication.reset_password_subtitle"
        />
        <UpdatePasswordForm />
      </AppView>
    </AppScreen>
  );
};

export default ResetPassword;
