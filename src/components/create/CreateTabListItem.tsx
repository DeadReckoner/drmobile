import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';

interface CreateTabListItemProps {
  titleTranslationKey: TranslationKeysType;
  descriptionTranslationKey: TranslationKeysType;
}

export const CreateTabListItem = ({
  titleTranslationKey,
  descriptionTranslationKey,
}: CreateTabListItemProps) => {
  return (
    <AppView row paddingH-16 paddingV-20 bg-cardBG br40 gap-16>
      <AppView>
        <TranslatedText body1 translationKey={titleTranslationKey} />
        <TranslatedText xsm translationKey={descriptionTranslationKey} />
      </AppView>
    </AppView>
  );
};
