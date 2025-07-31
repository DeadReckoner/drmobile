import { AppTouchableOpacity } from '@/components/ui';
import React, { useRef } from 'react';
import { TouchableOpacityProps } from 'react-native-ui-lib';

const DELAY = 600;

const AppButton = ({ onPress, ...restProps }: TouchableOpacityProps) => {
  const lastPress = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current > DELAY) {
      lastPress.current = now;
      onPress?.();
    }
  };
  return (
    <AppTouchableOpacity
      activeOpacity={0.6}
      onPress={handlePress}
      {...restProps}
    />
  );
};

export default AppButton;
