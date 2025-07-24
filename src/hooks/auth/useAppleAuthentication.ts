import { AuthResult, IAuthError, IUser } from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import * as AppleAuthentication from 'expo-apple-authentication';

export const useAppleAuthentication = () => {
  const { linkAppleWithAuthProvider } = useAuth();
  const { t } = useLocalization();

  const signInWithApple = async (): Promise<AuthResult<IUser | IAuthError>> => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const response = await linkAppleWithAuthProvider(
          credential.identityToken,
        );
        return response;
      } else {
        throw new Error();
      }
    } catch (error) {
      const authError = error as IAuthError;
      const structuredError: { error: IAuthError } = {
        error: {
          code: authError.code,
          message: t('authentication.errors.default'),
        },
      };
      if (authError.code === 'ERR_REQUEST_CANCELED') {
        structuredError.error.message = '';
      }

      return structuredError;
    }
  };
  return { signInWithApple };
};
