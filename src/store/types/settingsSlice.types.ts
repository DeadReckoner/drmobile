import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { PurchasesPackage } from 'react-native-purchases';
import { Incubator } from 'react-native-ui-lib';

type ThemeModeType = 'light' | 'dark';

type ToastProps = React.ComponentProps<typeof Incubator.Toast>;
type ToastType = `${Incubator.ToastPresets}` | 'warning';
type ToastStateType = {
  isVisible: boolean;
  toastProps: Pick<ToastProps, 'message' | 'icon'> & { type: ToastType };
};

type IapStateType = {
  isProUser: boolean;
  activeProductId: string | null;
  expirationDate: string | null;
  priceString: string | null;
  planCycle: PurchasesPackage['packageType'] | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: string | null;
};

type DigestFrequencyType = 'daily' | 'weekly' | 'never';

type NotificationSettingsType = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  fAndAEnabled: boolean;
  applyToAllFriends: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  digestFrequency: DigestFrequencyType;
  digestDeliveryHour: number;
  digestDeliveryDayOfWeek: number;
  globalMuteUntil: string | null;
};

type SettingsStateType = {
  theme: ThemeModeType;
  language: SupportedLanguagesType;
  toast: ToastStateType;
  roadmapListCache?: string;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  iap: IapStateType;
  notificationSettings: NotificationSettingsType;
};

export type {
  DigestFrequencyType,
  IapStateType,
  NotificationSettingsType,
  SettingsStateType,
  ThemeModeType,
  ToastStateType,
  ToastType,
};
