export interface IAuthService {
  //eslint-disable-next-line no-unused-vars
  signInWithGoogle: (idToken: string) => Promise<IUser | undefined>;
}

export interface IUser {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface IAuthError {
  message: string;
  code: string;
}
