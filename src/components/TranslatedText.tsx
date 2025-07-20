import { AppText } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { TextProps } from 'react-native-ui-lib';

/**
 * The `Omit<TextProps, 'style'>` is used here ensuring compatibility with the `TranslatedTextProps` interface.
 * This is necessary because the `TextProps` is a 'type' not an interface.
 * This ensures the consistancy while using interfaces for component props
 */
type TranslatedTextProps = TextProps & {
  translationKey: TranslationKeysType;
};

export const TranslatedText = ({
  translationKey,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();

  return <AppText {...restProps}>{t(translationKey)}</AppText>;
};
