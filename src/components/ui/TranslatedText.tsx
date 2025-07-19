import { AppText } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TTranslationKeys } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { TextProps } from 'react-native-ui-lib';

type TTranslatedTextProps = TextProps & { translationKey: TTranslationKeys };

export const TranslatedText = ({
  translationKey,
  ...restProps
}: TTranslatedTextProps) => {
  const { t } = useLocalization();

  return <AppText {...restProps}>{t(translationKey)}</AppText>;
};
