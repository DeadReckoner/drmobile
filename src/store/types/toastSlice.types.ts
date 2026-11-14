import type { ImageRequireSource, ImageURISource } from 'react-native';
import { Incubator } from 'react-native-ui-lib';

type ToastProps = React.ComponentProps<typeof Incubator.Toast>;
type ToastType = `${Incubator.ToastPresets}` | 'warning';
type ToastStateType = {
  isVisible: boolean;
  // `icon` is narrowed from ImageSourcePropType: its readonly-array member
  // cannot be stored in the (mutable) Redux draft state.
  toastProps: Pick<ToastProps, 'message'> & {
    icon?: ImageRequireSource | ImageURISource;
    type: ToastType;
  };
};

export type { ToastProps, ToastStateType, ToastType };
