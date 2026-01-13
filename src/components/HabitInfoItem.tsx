import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';

export const HabitInfoItem = ({
  translationKey,
  value,
}: {
  translationKey: TranslationKeysType;
  value: string | number;
}) => {
  if (!value) return null;
  return (
    <>
      <TranslatedText regular translationKey={translationKey} />
      <AppText body2 light textColor>
        {value}
      </AppText>
      <Divider />
    </>
  );
};
