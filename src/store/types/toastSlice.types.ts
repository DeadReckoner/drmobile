import { Incubator } from 'react-native-ui-lib';

type ToastProps = React.ComponentProps<typeof Incubator.Toast>;
type ToastType = `${Incubator.ToastPresets}` | 'warning';
type ToastStateType = {
  isVisible: boolean;
  toastProps: Pick<ToastProps, 'message' | 'icon'> & { type: ToastType };
};

export type { ToastProps, ToastStateType, ToastType };
