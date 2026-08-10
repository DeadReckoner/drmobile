import ExpoCheckbox from 'expo-checkbox';
import { StyleSheet, ViewProps } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface AppCheckboxProps {
  value?: boolean;
  onValueChange?: (_value: boolean) => void;
  disabled?: boolean;
  color?: string;
  style?: ViewProps['style'];
}

export function AppCheckbox({
  value,
  onValueChange,
  disabled,
  color,
  style,
}: AppCheckboxProps) {
  const checkedColor = color ?? Colors.primary;

  return (
    <ExpoCheckbox
      hitSlop={16}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      color={value ? checkedColor : undefined}
      style={[
        {
          backgroundColor: Colors.primary,
          borderColor: Colors.primary,
        },
        styles.checkbox,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    padding: 4,
    margin: 2,
  },
});
