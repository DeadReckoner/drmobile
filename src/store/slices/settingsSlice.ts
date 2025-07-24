import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import {
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
    toastProps: {},
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

    showToast(state, action: PayloadAction<Partial<ToastStateType>>) {
      state.toast.isVisible = true;
      state.toast.toastProps = action.payload.toastProps;
    },
    hideToast(state) {
      state.toast.isVisible = false;
      state.toast.toastProps = {};
    },
  },
});

export const {
  setThemeAction,
  toggleThemeAction,
  setLanguageAction,
  showToast,
  hideToast,
} = settingsSlice.actions;

export const selectTheme = createAppSelector((state) => state.settings.theme);
export const selectLanguage = createAppSelector(
  (state) => state.settings.language,
);
export const selectToastSettings = createAppSelector(
  (state) => state.settings.toast,
);

export const settingsReducer = persistReducer(
  {
    blacklist: ['toast'],
    storage: AsyncStorage,
    key: 'settings',
  },
  settingsSlice.reducer,
);
