export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  access_token: string;
}

export interface IAuthError {
  message: string;
  code?: string;
}

export type AuthResult<T = IUser> = {
  data?: T;
  error?: IAuthError;
};

export interface IAuthService {
  linkGoogleWithAuthProvider: (_idToken: string) => Promise<AuthResult<IUser>>;
  linkAppleWithAuthProvider: (_idToken: string) => Promise<AuthResult<IUser>>;
  signInEmailWithAuthProvider: (
    _email: string,
    _password: string,
  ) => Promise<AuthResult<IUser>>;
}

export interface ISupabaseAuthError {
  message: string;
  code: string;
}
