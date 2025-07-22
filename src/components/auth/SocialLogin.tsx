import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { AppView } from '@/components/ui';
import React from 'react';

const SocialLogin = () => {
  return (
    <AppView>
      <GoogleAuthButton />
    </AppView>
  );
};

export default SocialLogin;
