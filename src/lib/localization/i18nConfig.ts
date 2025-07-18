import { TSupportedLanguage } from '@/lib/localization/i18n.types';
import en from '@/lib/localization/translations/en.json';
import es from '@/lib/localization/translations/es.json';
import fr from '@/lib/localization/translations/fr.json';
import { I18n } from 'i18n-js';

const translations: Record<TSupportedLanguage, typeof en> = {
  en,
  es,
  fr,
};

const i18nConfig = new I18n(translations, {
  defaultLocale: 'en',
  enableFallback: true,
});

export default i18nConfig;
