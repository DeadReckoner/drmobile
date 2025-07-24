import { AuthResult, IAuthService, IUser } from '@/hooks/auth/types/auth.types';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setUserAction } from '@/store/slices/authSlice';

export const useAuth = (): IAuthService => {
  const dispatch = useAppDispatch();
  const authProvider = useSupabaseAuth();

  const linkGoogleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResult<IUser>> => {
    const response = await authProvider.linkGoogleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setUserAction(response.data));
    }
    return response;
  };

  const linkAppleWithAuthProvider = async (
    idToken: string,
  ): Promise<AuthResult<IUser>> => {
    const response = await authProvider.linkAppleWithAuthProvider(idToken);
    if (response.data) {
      dispatch(setUserAction(response.data));
    }
    return response;
  };

  return {
    linkGoogleWithAuthProvider,
    linkAppleWithAuthProvider,
  };
};
