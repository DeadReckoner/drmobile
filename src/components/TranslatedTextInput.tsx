import { AppText, AppTextField, AppView } from '@/components/ui';
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
  error?: string | boolean;
  onInputPress?: Function;
};

export const TranslatedTextInput = ({
  labelKey,
  placeholderKey,
  error,
  editable = true,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();

  return (
    <AppView marginB-16>
      <AppTextField
        body2
        fieldStyle={[
          styles.fieldStyle,
          {
            borderColor: Colors.secondary,
            opacity: editable ? 1 : 0.3,
          },
        ]}
        labelProps={{ 'marginB-8': true }}
        label={t(labelKey)}
        editable={editable}
        multiline
        placeholder={placeholderKey && t(placeholderKey)}
        {...restProps}
      />
      {!!error && (
        <AppText error sm marginT-8>
          {error}
        </AppText>
      )}
    </AppView>
  );
};

const styles = StyleSheet.create({
  fieldStyle: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    maxHeight: 150,
  },
  labelStyle: {
    marginBottom: 8,
  },
  labelProps: {
    marginBottom: 8,
  },
});
