import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import {
  SettingsStateType,
  ThemeModeType,
} from '@/store/types/settingsSlice.types';
import { RootStateType } from '@/store/types/store.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SettingsStateType = {
  theme: 'dark',
  language: {
    languageCode: 'en',
    languageName: 'English',
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
  },
});

export const { setThemeAction, toggleThemeAction, setLanguageAction } =
  settingsSlice.actions;

export const selectTheme = (state: RootStateType) => state.settings.theme;
export const selectLanguage = (state: RootStateType) => state.settings.language;

export const settingsReducer = settingsSlice.reducer;
