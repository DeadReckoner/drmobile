import { TranslationKeysType } from '@/lib/localization/types/i18n.types';

export const isRequiredMessage = (
  label: string,
  t: (_: TranslationKeysType) => string,
) => `${label} ${t('common.is_required')}`;

export const isInvalidMessage = (
  label: string,
  t: (_: TranslationKeysType) => string,
) => `${label} ${t('common.is_invalid')}`;
