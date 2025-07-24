import { AuthResult, IAuthError, IUser } from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AuthError, isAuthError } from '@supabase/supabase-js';

export const useGoogleAuthentication = () => {
  const { linkGoogleWithAuthProvider } = useAuth();
  const { t } = useLocalization();

  const signInWithGoogle = async (): Promise<
    AuthResult<IUser | IAuthError>
  > => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleAuthResponse = await GoogleSignin.signIn();

      if (
        isSuccessResponse(googleAuthResponse) &&
        googleAuthResponse.data.idToken
      ) {
        const response = await linkGoogleWithAuthProvider(
          googleAuthResponse.data.idToken,
        );
        return response;
      } else {
        throw new AuthError('', 400, statusCodes.SIGN_IN_CANCELLED);
      }
    } catch (error) {
      const structuredError: { error: IAuthError } = {
        error: {
          code: '',
          message: t('authentication.errors.default'),
        },
      };

      structuredError.error.code = (error as IAuthError).code || '';
      if (isAuthError(error)) {
        structuredError.error.message =
          error.code === statusCodes.SIGN_IN_CANCELLED ? '' : error.message;
      } else if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            structuredError.error.message = t(
              'authentication.errors.google.in_progress',
            );
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            structuredError.error.message = t(
              'authentication.errors.google.play_services_not_availabel',
            );
            break;
        }
      }
      return structuredError;
    }
  };

  return { signInWithGoogle };
};
