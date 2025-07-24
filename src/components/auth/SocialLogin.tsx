import { AppleAuthButton } from '@/components/auth/AppleAuthButton';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { Divider } from '@/components/Divider';
import { AppView } from '@/components/ui';
import React from 'react';

interface SocialLoginProps {
  onSuccessfullLogin: () => void;
}

export const SocialLogin = ({ onSuccessfullLogin }: SocialLoginProps) => {
  return (
    <AppView>
      <GoogleAuthButton onSuccessfullLogin={onSuccessfullLogin} />
      <Divider margin-8 />
      <AppleAuthButton onSuccessfullLogin={onSuccessfullLogin} />
    </AppView>
  );
};
