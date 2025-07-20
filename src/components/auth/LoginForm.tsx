import { AppInputWithLabel } from '@/components/form/AppInputWithLabel';
import { AppView } from '@/components/ui';
import React from 'react';

export const LoginForm = () => {
  return (
    <AppView>
      <AppInputWithLabel label="authentication.your_email" />
    </AppView>
  );
};
