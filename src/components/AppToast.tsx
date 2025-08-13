import { AppRNUIToast } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { ToastType } from '@/store/types/settingsSlice.types';

import { Colors, ToastProps, Typography } from 'react-native-ui-lib';

export const AppToast = () => {
  const { isVisible, toastProps, hideToast } = useToast();
  const toastTypeMap: Record<
    ToastType,
    Pick<ToastProps, 'preset' | 'backgroundColor' | 'messageStyle'>
  > = {
    success: {
      preset: 'success',
      backgroundColor: Colors.success,
    },
    failure: {
      preset: 'failure',
      backgroundColor: Colors.error,
    },
    warning: {
      preset: 'failure',
      backgroundColor: Colors.warning,
      messageStyle: { color: Colors.black },
    },
    offline: {
      preset: 'failure',
      backgroundColor: Colors.$backgroundDark,
    },
    general: {
      preset: 'general',
      backgroundColor: Colors.primary,
    },
  };
  const toastConfig = toastTypeMap[toastProps?.type ?? 'general'];

  return (
    <AppRNUIToast
      visible={isVisible}
      position={'bottom'}
      preset={toastConfig.preset}
      message={toastProps?.message}
      swipeable={false}
      onDismiss={hideToast}
      autoDismiss={3000}
      backgroundColor={toastConfig.backgroundColor}
      iconColor={Colors.white}
      messageStyle={[Typography.caption, { color: Colors.textOnPrimary }]}
      enableHapticFeedback
      {...toastProps}
    />
  );
};
