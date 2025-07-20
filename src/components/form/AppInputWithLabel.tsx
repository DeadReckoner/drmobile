import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';

interface AppInputWithLableProps {
  label: TranslationKeysType;
}

export const AppInputWithLabel = ({ label }: AppInputWithLableProps) => {
  return (
    <AppView>
      <TranslatedTextInput
        textColor
        translationKey={label}
        placeholder="hello email"
        label="Your Email"
      />
    </AppView>
  );
};
