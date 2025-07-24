import { IUser } from '@/hooks/auth/types/auth.types';

type AuthStateType = {
  isLoading: boolean;
  user: IUser;
};

export type { AuthStateType };
