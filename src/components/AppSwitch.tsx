import { AppRNUISwitch } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors, SwitchProps } from 'react-native-ui-lib';

export const AppSwitch = ({ ...props }: SwitchProps) => {
  const { theme } = useAppTheme();
  return (
    <AppRNUISwitch
      thumbColor={Colors.white}
      offColor={Colors.highlight}
      onColor={theme === 'dark' ? Colors.success : Colors.secondary}
      style={style.transform}
      {...props}
    />
  );
};
const style = StyleSheet.create({
  transform: { transform: [{ scale: 1.2 }] },
});
