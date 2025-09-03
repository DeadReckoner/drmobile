import { AppIcon } from '@/components/AppIcon';
import {
  AppText,
  AppTextField,
  AppTouchableOpacity,
  AppView,
} from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useState } from 'react';
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
  reduceOpacityWhenDisabled?: boolean;
};

export const TranslatedTextInput = ({
  labelKey,
  placeholderKey,
  error,
  editable = true,
  reduceOpacityWhenDisabled = true,
  secureTextEntry,
  ...restProps
}: TranslatedTextProps) => {
  const { t } = useLocalization();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((show) => !show);
  };

  const renderTrailingAccessory = () => {
    if (!secureTextEntry) return undefined;

    return (
      <AppTouchableOpacity onPress={togglePasswordVisibility}>
        <AppIcon
          set="Feather"
          name={!showPassword ? 'eye-off' : 'eye'}
          size={20}
          color={Colors.secondary}
        />
      </AppTouchableOpacity>
    );
  };

  return (
    <AppView marginB-16>
      <AppTextField
        body2
        fieldStyle={[
          styles.fieldStyle,
          {
            borderColor: Colors.secondary,
            opacity: !reduceOpacityWhenDisabled || editable ? 1 : 0.3,
          },
        ]}
        labelProps={{ 'marginB-8': true }}
        label={t(labelKey)}
        editable={editable}
        placeholder={placeholderKey && t(placeholderKey)}
        secureTextEntry={secureTextEntry && !showPassword}
        trailingAccessory={renderTrailingAccessory()}
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
