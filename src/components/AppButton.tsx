import { AppTouchableOpacity } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { TouchableOpacityProps } from 'react-native-ui-lib';

const DELAY = 300;

export const AppButton = ({ onPress, ...restProps }: TouchableOpacityProps) => {
  const lastPress = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current > DELAY) {
      lastPress.current = now;
      onPress?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  return (
    <AppTouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={handlePress}
      {...restProps}
    />
  );
};
