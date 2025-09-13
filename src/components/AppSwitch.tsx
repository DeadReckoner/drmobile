import { AppRNUISwitch } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectTheme } from '@/store/slices/settingsSlice';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors, SwitchProps } from 'react-native-ui-lib';

export const AppSwitch = ({ ...props }: SwitchProps) => {
  const theme = useAppSelector(selectTheme);
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
