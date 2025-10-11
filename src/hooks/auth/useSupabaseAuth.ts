import {
  AuthResultType,
  AuthUserSessionType,
  AuthUserWithoutSessionType,
  IAuthService,
  SupabaseProviderErrorResponseType,
  UserAttributesType,
} from '@/hooks/auth/types/auth.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { getAppRedirectUriScheme } from '@/utils/navigation.utils';
import { AuthError } from '@supabase/supabase-js';

const SUPABASE_AUTH_ERRORS = [
  'invalid_credentials',
  'email_exists',
  'email_not_confirmed',
  'email_address_invalid',
  'weak_password',
  'same_password',
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

  const signInEmailWithAuthProvider: IAuthService['signInEmailWithAuthProvider'] =
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return getSupabaseAuthError(error);
        }

        return getAppUserFromSupabase(data);
      } catch {
        return getSupabaseAuthError();
      }
    };

  const signUpEmailWithAuthProvider: IAuthService['signUpEmailWithAuthProvider'] =
    async (email, password, metadata) => {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: getAppRedirectUriScheme('/'),
          },
        });

        if (error) {
          return getSupabaseAuthError(error);
        }
        if (!data?.user) {
          return getSupabaseAuthError();
        }

        return getAppSessionLessUserFromSupabase({ user: data.user });
      } catch {
        return getSupabaseAuthError();
      }
    };

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

        return getAppUserFromSupabase(data);
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

        return getAppUserFromSupabase(data);
      } catch {
        return getSupabaseAuthError();
      }
    };

  const sendOTPViaEmailWithAuthProvider: IAuthService['sendOTPViaEmailWithAuthProvider'] =
    async (email: string) => {
      try {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email,
        });

        if (error) {
          return getSupabaseAuthError(error);
        }

        return {
          data: { isMailSent: true },
        };
      } catch {
        return getSupabaseAuthError();
      }
    };

  const verifyOTPViaEmailWithAuthProvider: IAuthService['verifyOTPViaEmailWithAuthProvider'] =
    async (email: string, otp: string) => {
      try {
        const { error: verifyOTPError, data } =
          await supabaseClient.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
          });

        if (verifyOTPError) {
          return getSupabaseAuthError(verifyOTPError);
        }
        if (!data.user || !data.session?.access_token) {
          return getSupabaseAuthError();
        }

        return getAppUserFromSupabase({
          user: data.user,
          session: data.session,
        });
      } catch {
        return getSupabaseAuthError();
      }
    };

  const updateUserWithAuthProvider: IAuthService['updateUserWithAuthProvider'] =
    async (attributes: UserAttributesType) => {
      try {
        const { error, data } =
          await supabaseClient.auth.updateUser(attributes);

        if (error) {
          return getSupabaseAuthError(error);
        }

        if (!data?.user) {
          return getSupabaseAuthError();
        }

        return getAppSessionLessUserFromSupabase({ user: data.user });
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

  const getSupabaseAuthError = (
    error?: AuthError,
  ): SupabaseProviderErrorResponseType => {
    return {
      error: {
        message: getLocalizedErrorMessage(error),
        code: error?.code || 'unexpected_failure',
      },
    };
  };

  const getAppUserFromSupabase = ({
    user,
    session,
  }: AuthUserSessionType): AuthResultType => {
    return {
      data: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name,
        avatar: user.user_metadata?.avatar_url,
        access_token: session.access_token,
      },
    };
  };

  const getAppSessionLessUserFromSupabase = ({
    user,
  }: AuthUserWithoutSessionType) => {
    return {
      data: {
        id: user.id,
        email: user.email || user.user_metadata?.email || '',
        name: user.user_metadata?.name,
        avatar: user.user_metadata?.avatar_url,
      },
    };
  };

  return {
    updateUserWithAuthProvider,
    sendOTPViaEmailWithAuthProvider,
    verifyOTPViaEmailWithAuthProvider,
    signUpEmailWithAuthProvider,
    signInEmailWithAuthProvider,
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
