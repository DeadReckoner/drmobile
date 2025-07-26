import {
  AuthResultType,
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

  const signInEmailWithAuthProvider = async (
    email: string,
    password: string,
  ): Promise<AuthResultType<UserType>> => {
    const response = await authProvider.signInEmailWithAuthProvider(
      email,
      password,
    );
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  const signUpEmailWithAuthProvider = async (
    email: string,
    password: string,
  ): Promise<AuthResultType<SessionLessUserType>> => {
    const response = await authProvider.signUpEmailWithAuthProvider(
      email,
      password,
    );
    if (response.data?.access_token && isUserWithSession(response.data)) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  const linkGoogleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResultType<UserType>> => {
    const response = await authProvider.linkGoogleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  const linkAppleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResultType<UserType>> => {
    const response = await authProvider.linkAppleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  function isUserWithSession(user: SessionLessUserType): user is UserType {
    return typeof user.access_token === 'string';
  }

  return {
    signUpEmailWithAuthProvider,
    signInEmailWithAuthProvider,
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
