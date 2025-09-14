import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';

interface SettingsItemProps {
  translationKey: TranslationKeysType;
  rightElement?: React.ReactNode;
}

export const SettingsItem = ({
  translationKey,
  rightElement,
}: SettingsItemProps) => {
  return (
    <>
      <LineDivider bg-lineDivider marginV-16 />
      <AppView row centerV spread paddingH-16>
        <TranslatedText body2 translationKey={translationKey} />
        <AppView right>{rightElement}</AppView>
      </AppView>
    </>
  );
};
