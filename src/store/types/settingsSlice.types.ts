import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';

type ThemeModeType = 'light' | 'dark';

type SettingsStateType = {
  theme: ThemeModeType;
  language: SupportedLanguagesType;
};

export type { SettingsStateType, ThemeModeType };
