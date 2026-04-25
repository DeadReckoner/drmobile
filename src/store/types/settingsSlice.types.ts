import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { Incubator } from 'react-native-ui-lib';

type ThemeModeType = 'light' | 'dark';

type ToastProps = React.ComponentProps<typeof Incubator.Toast>;
type ToastType = `${Incubator.ToastPresets}` | 'warning';
type ToastStateType = {
  isVisible: boolean;
  toastProps: Pick<ToastProps, 'message' | 'icon'> & { type: ToastType };
};

type SettingsStateType = {
  theme: ThemeModeType;
  language: SupportedLanguagesType;
  toast: ToastStateType;
  roadmapListCache?: string;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
};

export type { SettingsStateType, ThemeModeType, ToastStateType, ToastType };
