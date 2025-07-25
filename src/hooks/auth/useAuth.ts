import { AuthResult, IAuthService, IUser } from '@/hooks/auth/types/auth.types';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setAuthUserAction } from '@/store/slices/authSlice';

export const useAuth = (): IAuthService => {
  const dispatch = useAppDispatch();
  const authProvider = useSupabaseAuth();

  const signInEmailWithAuthProvider = async (
    email: string,
    password: string,
  ): Promise<AuthResult<IUser>> => {
    const response = await authProvider.signInEmailWithAuthProvider(
      email,
      password,
    );
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  const linkGoogleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResult<IUser>> => {
    const response = await authProvider.linkGoogleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  const linkAppleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResult<IUser>> => {
    const response = await authProvider.linkAppleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setAuthUserAction(response.data));
    }
    return response;
  };

  return {
    signInEmailWithAuthProvider,
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
