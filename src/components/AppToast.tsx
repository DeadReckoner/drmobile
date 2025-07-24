import useToast from '@/hooks/useToast';
import React from 'react';
import { Colors, Incubator, Typography } from 'react-native-ui-lib';

const AppToast = () => {
  const { isVisible, hideToast, toastProps } = useToast();
  return (
    <Incubator.Toast
      visible={isVisible}
      position={'bottom'}
      preset={'general'}
      swipeable={false}
      onDismiss={hideToast}
      autoDismiss={3000}
      backgroundColor={Colors.error}
      iconColor={Colors.white}
      messageStyle={Typography.caption}
      enableHapticFeedback
      {...toastProps}
    />
  );
};

export default AppToast;
