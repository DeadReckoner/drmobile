import { AppTextField } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { StyleSheet } from 'react-native';
import { Colors, TextFieldProps } from 'react-native-ui-lib';

/**
 * Using 'type' instead of 'interface' because the `TextFieldProps` is a 'type' not an 'interface' so it cannot be extended.
 **/
type TranslatedTextProps = TextFieldProps & {
  labelKey: TranslationKeysType;
  placeholderKey?: TranslationKeysType;
};

export const TranslatedTextInput = ({
  labelKey,
  placeholderKey,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();

  return (
    <AppTextField
      body2
      marginB-16
      fieldStyle={[styles.fieldStyle, { borderColor: Colors.secondary }]}
      labelProps={{ 'marginB-8': true }}
      label={t(labelKey)}
      placeholder={placeholderKey && t(placeholderKey)}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  fieldStyle: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  labelStyle: {
    marginBottom: 8,
  },
});
