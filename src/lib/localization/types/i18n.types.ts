import en from '@/lib/localization/translations/en.json';

type RecursiveKeyOf<TObj, TPrefix extends string = ''> = {
  [K in keyof TObj]: TObj[K] extends Record<string, any>
    ? RecursiveKeyOf<TObj[K], `${TPrefix}${K & string}.`>
    : `${TPrefix}${K & string}`;
}[keyof TObj];

export type TTranslationKeys = RecursiveKeyOf<typeof en>;

export type TSupportedLanguages =
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

export type TSupportedLanguageCodes = TSupportedLanguages['languageCode'];
