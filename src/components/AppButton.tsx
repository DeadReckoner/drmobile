import { AppTouchableOpacity } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';
import React, { useRef } from 'react';
import { TouchableOpacityProps } from 'react-native-ui-lib';

const DELAY = 300;

export const AppButton = ({ onPress, ...restProps }: TouchableOpacityProps) => {
  const lastPress = useRef(0);
  const { impactAsync } = useHaptics();

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current > DELAY) {
      lastPress.current = now;
      onPress?.();
      impactAsync();
    }
  };
  return (
    <AppTouchableOpacity
      hitSlop={8}
      activeOpacity={onPress ? 0.6 : 1}
      onPress={handlePress}
      {...restProps}
    />
  );
};
