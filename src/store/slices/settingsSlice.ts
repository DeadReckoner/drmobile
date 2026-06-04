import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import type {
  IapStateType,
  NotificationSettingsType,
  SettingsStateType,
  ThemeModeType,
  ToastStateType,
} from '@/store/types/settingsSlice.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

const initialState: SettingsStateType = {
  theme: 'dark',
  language: {
    languageCode: 'en',
    languageName: 'English',
  },
  notificationsEnabled: false,
  hapticsEnabled: true,
  notificationSettings: {
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
  },
  toast: {
    isVisible: false,
    toastProps: { type: 'general' },
  },
  roadmapListCache: '',
  iap: {
    isProUser: false,
    activeProductId: null,
    expirationDate: null,
    priceString: null,
    planCycle: null,
    isLoading: false,
    error: null,
    lastChecked: null,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeAction(state, action: PayloadAction<ThemeModeType>) {
      state.theme = action.payload;
    },
    toggleThemeAction(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    setLanguageAction(state, action: PayloadAction<SupportedLanguagesType>) {
      state.language = action.payload;
    },
    setNotificationMode(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    showToastAction(
      state,
      action: PayloadAction<Pick<ToastStateType, 'toastProps'>>,
    ) {
      state.toast.isVisible = true;
      state.toast.toastProps = action.payload.toastProps;
    },
    setHapticsEnabled(state, action: PayloadAction<boolean>) {
      state.hapticsEnabled = action.payload;
    },
    setNotificationSettings(
      state,
      action: PayloadAction<Partial<NotificationSettingsType>>,
    ) {
      state.notificationSettings = {
        ...initialState.notificationSettings,
        ...(state.notificationSettings ?? {}),
        ...action.payload,
      };
    },
    syncNotificationSettingsFromApi(
      state,
      action: PayloadAction<NotificationSettingsType>,
    ) {
      state.notificationSettings = action.payload;
    },
    hideToastAction(state) {
      state.toast.isVisible = false;
    },
    setLastRoadmapListCacheDay(state, action) {
      state.roadmapListCache = action.payload;
    },
    setIapLoading(state, action: PayloadAction<boolean>) {
      state.iap.isLoading = action.payload;
    },
    setIapError(state, action: PayloadAction<string | null>) {
      state.iap.error = action.payload;
    },
    setProEntitlement(
      state,
      action: PayloadAction<
        Pick<
          IapStateType,
          | 'isProUser'
          | 'activeProductId'
          | 'expirationDate'
          | 'priceString'
          | 'planCycle'
        >
      >,
    ) {
      state.iap.isProUser = action.payload.isProUser;
      state.iap.activeProductId = action.payload.activeProductId;
      state.iap.expirationDate = action.payload.expirationDate;
      state.iap.priceString = action.payload.priceString;
      state.iap.planCycle = action.payload.planCycle;
    },
    clearProEntitlement(state) {
      state.iap.isProUser = false;
      state.iap.activeProductId = null;
      state.iap.expirationDate = null;
      state.iap.priceString = null;
      state.iap.planCycle = null;
    },
    setLastChecked(state, action: PayloadAction<string>) {
      state.iap.lastChecked = action.payload;
    },
    resetSettingsSlice: () => initialState,
  },
});

export const {
  setThemeAction,
  toggleThemeAction,
  setLanguageAction,
  showToastAction,
  hideToastAction,
  setLastRoadmapListCacheDay,
  setNotificationMode,
  setHapticsEnabled,
  setNotificationSettings,
  syncNotificationSettingsFromApi,
  resetSettingsSlice,
  setIapLoading,
  setIapError,
  setProEntitlement,
  clearProEntitlement,
  setLastChecked,
} = settingsSlice.actions;
export const selectHapticsEnabled = createAppSelector(
  (state) => state.settings.hapticsEnabled,
);

export const selectTheme = createAppSelector((state) => state.settings.theme);
export const selectLanguage = createAppSelector(
  (state) => state.settings.language,
);
export const selectToastSettings = createAppSelector(
  (state) => state.settings.toast,
);
export const selectSettings = createAppSelector((state) => state.settings);
export const selectNotificationsEnabled = createAppSelector(
  (state) => state.settings.notificationsEnabled,
);
export const selectNotificationSettings = createAppSelector(
  (state) =>
    state.settings.notificationSettings ?? initialState.notificationSettings,
);
export const selectIap = createAppSelector((state) => state.settings.iap);
export const selectIsProUser = createAppSelector(
  (state) => state.settings.iap.isProUser,
);
export const selectIapLoading = createAppSelector(
  (state) => state.settings.iap.isLoading,
);
export const selectIapError = createAppSelector(
  (state) => state.settings.iap.error,
);
export const selectActiveProductId = createAppSelector(
  (state) => state.settings.iap.activeProductId,
);
export const selectIapExpirationDate = createAppSelector(
  (state) => state.settings.iap.expirationDate,
);

export const settingsReducer = persistReducer(
  {
    blacklist: ['toast'],
    storage: AsyncStorage,
    key: 'settings',
  },
  settingsSlice.reducer,
);
