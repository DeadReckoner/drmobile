import { AppTextField } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { Colors, TextFieldProps } from 'react-native-ui-lib';

type TranslatedTextProps = TextFieldProps & {
  translationKey: TranslationKeysType;
};

export const TranslatedTextInput = ({
  translationKey,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();

  return (
    <AppTextField
      body2
      fieldStyle={{
        borderWidth: 1,
        borderColor: Colors.outline,
        borderRadius: 8,
        padding: 16,
      }}
      label={t(translationKey)}
      {...restProps}
    />
  );
};
