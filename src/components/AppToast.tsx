import { Loader } from '@/components/Loader';
import { AppRNUIToast } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { ToastType } from '@/store/types/settingsSlice.types';
import { StyleSheet } from 'react-native';

import { Colors, ToastProps, Typography } from 'react-native-ui-lib';

export const AppToast = () => {
  const { isVisible, toastProps, hideToast } = useToast();
  const toastTypeMap: Record<
    ToastType,
    Pick<
      ToastProps,
      'preset' | 'backgroundColor' | 'messageStyle' | 'showLoader'
    >
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
      preset: 'offline',
      backgroundColor: Colors.$backgroundDark,
    },
    general: {
      preset: 'general',
      backgroundColor: Colors.accent,
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
      style={[style.toast, { shadowColor: toastConfig.backgroundColor }]}
      loaderElement={<Loader transparent />}
      showLoader={toastConfig.showLoader}
      {...toastProps}
    />
  );
};

const style = StyleSheet.create({
  toast: {
    shadowOpacity: 0.5,
    shadowRadius: 10,
    bottom: 16,
    shadowOffset: { width: 0, height: 0 },
  },
});
