import { IAuthService, IUser } from '@/hooks/auth/types/auth.types';
import { useLocalization } from '@/hooks/useLocalization';
import i18nConfig from '@/lib/localization/i18nConfig';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { AuthError } from '@supabase/supabase-js';

const SUPABASE_AUTH_ERRORS = [
  'invalid_credentials',
  'email_exists',
  'email_not_confirmed',
  'email_address_invalid',
  'weak_password',
  'user_not_found',
  'user_banned',
  // Session/refresh
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
  // OAuth (Google/Apple)
  'provider_email_needs_verification',
  'provider_disabled',
  'oauth_provider_not_supported',
  'bad_oauth_callback',
  'bad_oauth_state',
  // General
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'unexpected_failure',
] as const;

export const useSupabaseAuth = (): IAuthService => {
  const { t } = useLocalization();

  const signInWithGoogle = async (idToken: string): Promise<IUser> => {
    const { data, error } = await supabaseClient.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) {
      error.message = getLocalizedErrorMessage(error);
      throw error;
    }
    return {
      email: data.user.email,
      id: data.user.id,
    };
  };

  const getLocalizedErrorMessage = (error: AuthError): string => {
    const fallback = i18nConfig.t('authentication.errors.default');

    if (!error || typeof error !== 'object' || !('message' in error)) {
      return fallback;
    }

    const errorKey = error.code as (typeof SUPABASE_AUTH_ERRORS)[number];
    return SUPABASE_AUTH_ERRORS.includes(errorKey)
      ? t(`authentication.errors.${errorKey}` as TranslationKeysType)
      : fallback;
  };

  return {
    signInWithGoogle,
  };
};
