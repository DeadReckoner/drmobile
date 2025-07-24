import { IAuthService } from '@/hooks/auth/types/auth.types';
import { useLocalization } from '@/hooks/useLocalization';
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

type SupabaseAuthErrorCodeType = (typeof SUPABASE_AUTH_ERRORS)[number];

export const useSupabaseAuth = (): IAuthService => {
  const { t } = useLocalization();

  const linkGoogleWithAuthProvider: IAuthService['linkGoogleWithAuthProvider'] =
    async (idToken: string) => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          return getSupabaseAuthError(error);
        }

        return {
          data: {
            email: data.user.email,
            id: data.user.id,
            name: data.user.user_metadata?.name,
            avatar: data.user.user_metadata?.avatar_url,
          },
        };
      } catch {
        return getSupabaseAuthError();
      }
    };

  const linkAppleWithAuthProvider: IAuthService['linkAppleWithAuthProvider'] =
    async (idToken: string) => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithIdToken({
          provider: 'apple',
          token: idToken,
        });

        if (error) {
          return getSupabaseAuthError(error);
        }

        return {
          data: {
            email: data.user.email,
            id: data.user.id,
            name: data.user.user_metadata?.name,
            avatar: data.user.user_metadata?.avatar_url,
          },
        };
      } catch {
        return getSupabaseAuthError();
      }
    };

  const getLocalizedErrorMessage = (error?: AuthError): string => {
    const fallback = t('authentication.errors.default');

    if (!error) {
      return fallback;
    }

    const errorKey = error.code as SupabaseAuthErrorCodeType;
    return SUPABASE_AUTH_ERRORS.includes(errorKey)
      ? t(`authentication.errors.${errorKey}` as TranslationKeysType)
      : fallback;
  };

  const getSupabaseAuthError = (error?: AuthError) => {
    return {
      error: {
        message: getLocalizedErrorMessage(error),
        code: error?.code || 'unexpected_failure',
      },
    };
  };

  return {
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
