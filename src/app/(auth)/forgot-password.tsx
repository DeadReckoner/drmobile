import { AppScreen } from '@/components/AppScreen';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppView } from '@/components/ui';
import React from 'react';

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
    </AppScreen>
  );
};

export default ForgotPassword;
