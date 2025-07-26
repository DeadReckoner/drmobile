import { Session, User } from '@supabase/supabase-js';

export interface UserType {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  access_token: string;
}

export type AuthErrorType = {
  message: string;
  code?: string;
};

export type AuthUserSessionType = {
  user: User;
  session: Session;
};

export type AuthUserWithoutSessionType = {
  user: User;
  session?: Session;
};

export type SessionLessUserType = Omit<UserType, 'access_token'> & {
  access_token?: string;
};

export type AuthResultType<T = UserType> = {
  data?: T;
  error?: AuthErrorType;
};

export interface IAuthService {
  linkGoogleWithAuthProvider: (
    _idToken: string,
  ) => Promise<AuthResultType<UserType>>;
  linkAppleWithAuthProvider: (
    _idToken: string,
  ) => Promise<AuthResultType<UserType>>;
  signInEmailWithAuthProvider: (
    _email: string,
    _password: string,
  ) => Promise<AuthResultType<UserType>>;
  signUpEmailWithAuthProvider: (
    _email: string,
    _password: string,
  ) => Promise<AuthResultType<SessionLessUserType>>;
}
