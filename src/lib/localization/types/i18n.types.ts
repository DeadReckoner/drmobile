import en from '@/lib/localization/translations/en.json';

type RecursiveKeyOfType<TObj, TPrefix extends string = ''> = {
  [K in keyof TObj]: TObj[K] extends Record<string, any>
    ? RecursiveKeyOfType<TObj[K], `${TPrefix}${K & string}.`>
    : `${TPrefix}${K & string}`;
}[keyof TObj];

export type TranslationKeysType = RecursiveKeyOfType<typeof en>;

export type SupportedLanguagesType =
  | {
      languageName: 'English';
      languageCode: 'en';
    }
  | {
      languageName: 'Español';
      languageCode: 'es';
    }
  | {
      languageName: 'Français';
      languageCode: 'fr';
    };

export type SupportedLanguageCodesType = SupportedLanguagesType['languageCode'];
