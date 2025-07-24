import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { Incubator } from 'react-native-ui-lib';

type ThemeModeType = 'light' | 'dark';

type ToastProps = React.ComponentProps<typeof Incubator.Toast>;
type ToastStateType = {
  isVisible: boolean;
  toastProps?: Pick<ToastProps, 'message'>;
};

type SettingsStateType = {
  theme: ThemeModeType;
  language: SupportedLanguagesType;
  toast: ToastStateType;
};

export type { SettingsStateType, ThemeModeType, ToastStateType };
