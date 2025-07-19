import { TSupportedLanguages } from '@/lib/localization/types/i18n.types';

type TThemeMode = 'light' | 'dark';

type TSettingsState = {
  theme: TThemeMode;
  language: TSupportedLanguages;
};
export type { TSettingsState, TThemeMode };
