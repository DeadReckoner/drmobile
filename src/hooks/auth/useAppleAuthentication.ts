import {
  AuthErrorType,
  AuthResultType,
  UserType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setAuthLoadingAction,
  setAuthResolvedAction,
} from '@/store/slices/authSlice';
import * as AppleAuthentication from 'expo-apple-authentication';

export const useAppleAuthentication = () => {
  const { linkAppleWithAuthProvider } = useAuth();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();

  const signInWithApple = async (): Promise<
    AuthResultType<UserType | AuthErrorType>
  > => {
    try {
      dispatch(setAuthLoadingAction());
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
      const authError = error as AuthErrorType;
      const structuredError: { error: AuthErrorType } = {
        error: {
          code: authError.code,
          message: t('authentication.errors.default'),
        },
      };
      if (authError.code === 'ERR_REQUEST_CANCELED') {
        structuredError.error.message = '';
      }
      return structuredError;
    } finally {
      dispatch(setAuthResolvedAction());
    }
  };
  return { signInWithApple };
};
