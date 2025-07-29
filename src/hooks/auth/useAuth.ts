import {
  IAuthService,
  SessionLessUserType,
  UserType,
} from '@/hooks/auth/types/auth.types';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setAuthUserAction } from '@/store/slices/authSlice';

export const useAuth = (): IAuthService => {
  const dispatch = useAppDispatch();
  const authProvider = useSupabaseAuth();

  const signInEmailWithAuthProvider: IAuthService['signInEmailWithAuthProvider'] =
    async (email, password) => {
      const response = await authProvider.signInEmailWithAuthProvider(
        email,
        password,
      );
      if (response.data) {
        dispatch(setAuthUserAction(response.data));
      }
      return response;
    };

  const signUpEmailWithAuthProvider: IAuthService['signUpEmailWithAuthProvider'] =
    async (email, password) => {
      const response = await authProvider.signUpEmailWithAuthProvider(
        email,
        password,
      );
      if (response.data?.access_token && isUserWithSession(response.data)) {
        dispatch(setAuthUserAction(response.data));
      }
      return response;
    };

  const linkGoogleWithAuthProvider: IAuthService['linkGoogleWithAuthProvider'] =
    async (idToken) => {
      const response = await authProvider.linkGoogleWithAuthProvider(idToken);
      if (response.data) {
        dispatch(setAuthUserAction(response.data));
      }
      return response;
    };

  const linkAppleWithAuthProvider: IAuthService['linkAppleWithAuthProvider'] =
    async (idToken) => {
      const response = await authProvider.linkAppleWithAuthProvider(idToken);
      if (response.data) {
        dispatch(setAuthUserAction(response.data));
      }
      return response;
    };

  const sendOTPViaEmailWithAuthProvider: IAuthService['sendOTPViaEmailWithAuthProvider'] =
    async (email) => {
      const response =
        await authProvider.sendOTPViaEmailWithAuthProvider(email);
      return response;
    };

  const verifyOTPViaEmailWithAuthProvider: IAuthService['verifyOTPViaEmailWithAuthProvider'] =
    async (email, otp) => {
      const response = await authProvider.verifyOTPViaEmailWithAuthProvider(
        email,
        otp,
      );
      return response;
    };

  const updateUserWithAuthProvider: IAuthService['updateUserWithAuthProvider'] =
    async (userAttributes) => {
      const response =
        await authProvider.updateUserWithAuthProvider(userAttributes);
      return response;
    };

  function isUserWithSession(user: SessionLessUserType): user is UserType {
    return typeof user.access_token === 'string';
  }

  return {
    verifyOTPViaEmailWithAuthProvider,
    updateUserWithAuthProvider,
    sendOTPViaEmailWithAuthProvider,
    signUpEmailWithAuthProvider,
    signInEmailWithAuthProvider,
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
