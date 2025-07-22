import { IAuthService, IUser } from '@/hooks/auth/types/auth.types';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const useAuth = (): IAuthService => {
  const authProvider = useSupabaseAuth();

  const signInWithGoogle = async (
    idToken: string,
  ): Promise<IUser | undefined> => {
    try {
      const response = await authProvider.signInWithGoogle(idToken);
      return response;
    } catch {
      // console.error(error);
    }
  };

  return {
    signInWithGoogle,
  };
};

export default useAuth;
