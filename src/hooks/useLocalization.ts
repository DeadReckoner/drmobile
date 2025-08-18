import i18nConfig from '@/lib/localization/i18nConfig';
import {
  SupportedLanguagesType,
  TranslationKeysType,
} from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectLanguage,
  setLanguageAction,
} from '@/store/slices/settingsSlice';
import { useDispatch } from 'react-redux';

const LANGUAGE_OPTIONS: SupportedLanguagesType[] = [
  { languageName: 'English', languageCode: 'en' },
  { languageName: 'Español', languageCode: 'es' },
  { languageName: 'Français', languageCode: 'fr' },
];

export const useLocalization = () => {
  const dispatch = useDispatch();
  const selectedLanguage = useAppSelector(selectLanguage);

  const t = (key: TranslationKeysType, options?: Record<string, any>) => {
    return i18nConfig.t(key, options);
  };

  const setLanguage = async (language: SupportedLanguagesType) => {
    i18nConfig.locale = language.languageCode;
    dispatch(setLanguageAction(language));
  };

  const getSupportedLanguages = (): SupportedLanguagesType[] => {
    return LANGUAGE_OPTIONS;
  };

  const initializeLocalization = async () => {
    i18nConfig.locale = selectedLanguage.languageCode ?? 'en';
    dispatch(setLanguageAction(selectedLanguage));
  };

  return {
    selectedLanguage,
    t,
    setLanguage,
    getSupportedLanguages,
    initializeLocalization,
  };
};
