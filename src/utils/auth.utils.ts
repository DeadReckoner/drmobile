import { supabaseClient } from '@/lib/supabase/supabaseClient';

/**
 * Attempts to refresh the current user's session using the refresh token
 * @returns Promise with session data or null if refresh failed
 */
export const refreshUserSession = async () => {
  try {
    const refreshPromise = supabaseClient.auth.refreshSession();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session refresh timeout')), 10000);
    });

    const { data, error } = (await Promise.race([
      refreshPromise,
      timeoutPromise,
    ])) as Awaited<ReturnType<typeof supabaseClient.auth.refreshSession>>;

    if (error) {
      throw error;
    }
    return data?.session;
  } catch {
    return null;
  }
};

/**
 * Checks if an error response indicates a JWT/token issue
 * @param status HTTP status code
 * @param errorData Response error data
 * @returns boolean indicating if this is a token-related error
 */
export const isTokenError = (status: number, errors: unknown): boolean => {
  if (status === 401) {
    return true;
  }

  if (status === 403) {
    const errorData = errors as {
      error_code?: string;
      msg?: string;
      code?: number;
    };
    return (
      errorData?.error_code === 'bad_jwt' ||
      errorData?.msg?.includes('token is expired') ||
      errorData?.msg?.includes('invalid JWT') ||
      errorData?.msg?.includes('unable to parse or verify signature') ||
      errorData?.code === 403
    );
  }

  return false;
};

/**
 * Gets the current session from Supabase
 * @returns Current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data?.session;
  } catch {
    return null;
  }
};
