import { AppleAuthButton } from '@/components/auth/AppleAuthButton';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { Divider } from '@/components/Divider';
import { AppView } from '@/components/ui';
import { isIOS } from '@/utils/platform.utils';
import React from 'react';

export const SocialLogin = () => {
  return (
    <AppView>
      <GoogleAuthButton />
      {isIOS && (
        <>
          <Divider margin-8 />
          <AppleAuthButton />
        </>
      )}
    </AppView>
  );
};
