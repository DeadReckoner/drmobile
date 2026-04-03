import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import type {
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
  toast: {
    isVisible: false,
    toastProps: { type: 'general' },
  },
  roadmapListCache: '',
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

    showToastAction(
      state,
      action: PayloadAction<Pick<ToastStateType, 'toastProps'>>,
    ) {
      state.toast.isVisible = true;
      state.toast.toastProps = action.payload.toastProps;
    },
    hideToastAction(state) {
      state.toast.isVisible = false;
    },
    setLastRoadmapListCacheDay(state, action) {
      state.roadmapListCache = action.payload;
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
  resetSettingsSlice,
} = settingsSlice.actions;

export const selectTheme = createAppSelector((state) => state.settings.theme);
export const selectLanguage = createAppSelector(
  (state) => state.settings.language,
);
export const selectToastSettings = createAppSelector(
  (state) => state.settings.toast,
);
export const selectSettings = createAppSelector((state) => state.settings);

export const settingsReducer = persistReducer(
  {
    blacklist: ['toast'],
    storage: AsyncStorage,
    key: 'settings',
  },
  settingsSlice.reducer,
);
