import type {
  IapStateType,
  NotificationSettingsType,
  SettingsStateType,
} from '@/store/types/settingsSlice.types';
import type { MigrationManifest, PersistedState } from 'redux-persist';

const defaultIapState: IapStateType = {
  isProUser: false,
  activeProductId: null,
  expirationDate: null,
  priceString: null,
  planCycle: null,
  isLoading: false,
  error: null,
  lastChecked: null,
};

const defaultNotificationSettings: NotificationSettingsType = {
  pushEnabled: true,
  emailEnabled: true,
  fAndAEnabled: true,
  applyToAllFriends: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  digestFrequency: 'daily',
  digestDeliveryHour: 9,
  digestDeliveryDayOfWeek: 1,
  globalMuteUntil: null,
};

type PersistedRootState = PersistedState & {
  settings?: Partial<SettingsStateType>;
};

export const migrations: MigrationManifest = {
  // Backfills `iap` and `notificationSettings` for installs that persisted
  // `settings` before those fields existed (paywall/notifications feature),
  // since redux-persist replaces the whole substate with the stored blob and
  // does not add keys that are missing from it.
  2: (state) => {
    const persistedState = state as PersistedRootState | undefined;
    if (!persistedState?.settings) {
      return persistedState as PersistedState;
    }

    return {
      ...persistedState,
      settings: {
        ...persistedState.settings,
        iap: persistedState.settings.iap ?? defaultIapState,
        notificationSettings:
          persistedState.settings.notificationSettings ??
          defaultNotificationSettings,
      },
    };
  },
};
