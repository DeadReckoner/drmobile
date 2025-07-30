import { AppText } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';

import { TextProps } from 'react-native-ui-lib';

/**
 * Using 'type' instead of 'interface' because the `TextProps` is a 'type' not an 'interface' so it cannot be extended.
 **/

type TranslatedTextProps = TextProps & {
  translationKey: TranslationKeysType;
};

export const TranslatedText = ({
  translationKey,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();

  return (
    <AppText
      body2
      textColor
      style={[{ includeFontPadding: false }, restProps.style]}
      {...restProps}>
      {t(translationKey)}
    </AppText>
  );
};
