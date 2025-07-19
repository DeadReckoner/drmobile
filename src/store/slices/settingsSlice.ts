import { TSupportedLanguages } from '@/lib/localization/types/i18n.types';
import { TSettingsState, TThemeMode } from '@/store/types/settingsSlice.types';
import { RootState } from '@/store/types/store.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: TSettingsState = {
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
    setThemeAction(state, action: PayloadAction<TThemeMode>) {
      state.theme = action.payload;
    },
    toggleThemeAction(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLanguageAction(state, action: PayloadAction<TSupportedLanguages>) {
      state.language = action.payload;
    },
  },
});

export const { setThemeAction, toggleThemeAction, setLanguageAction } =
  settingsSlice.actions;

export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;

export const settingsReducer = settingsSlice.reducer;
