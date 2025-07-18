import {
  TSupportedLanguage,
  TTranslationKeys,
} from '@/lib/localization/i18n.types';
import i18nConfig from '@/lib/localization/i18nConfig';
import { useState } from 'react';

export const useLocalization = () => {
  const [locale, setLocale] = useState<TSupportedLanguage>('en');

  const t = (key: TTranslationKeys, options?: Record<string, any>) => {
    return i18nConfig.t(key, options);
  };

  const setLanguage = async (lang: TSupportedLanguage) => {
    i18nConfig.locale = lang;
    setLocale(lang);
  };

  const getTSupportedLanguages = (): TSupportedLanguage[] => {
    return ['en', 'es', 'fr'];
  };

  return {
    t,
    locale,
    setLanguage,
    getTSupportedLanguages,
  };
};
