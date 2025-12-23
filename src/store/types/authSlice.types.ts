import { UserType } from '@/hooks/auth/types/auth.types';

type AuthStateType = {
  isLoading: boolean;
  user: UserType;
};

export type { AuthStateType };
