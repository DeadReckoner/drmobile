import { AppScreen } from '@/components/AppScreen';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppView } from '@/components/ui';
import React from 'react';

const ResetPassword = () => {
  return (
    <AppScreen>
      <AppView flex paddingT-60>
        <ScreenHeader
          title="authentication.reset_password"
          subtitle="authentication.reset_password_subtitle"
        />
        <ResetPasswordForm />
      </AppView>
    </AppScreen>
  );
};

export default ResetPassword;
