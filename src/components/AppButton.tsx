import { AppTouchableOpacity } from '@/components/ui';
import React, { useRef } from 'react';
import { TouchableOpacityProps } from 'react-native-ui-lib';

const DELAY = 300;

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
      activeOpacity={onPress ? 0.6 : 1}
      onPress={handlePress}
      {...restProps}
    />
  );
};

export default AppButton;
