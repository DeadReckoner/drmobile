export type CreateUserParamsType = {
  first_name: string;
  last_name: string;
  email: string;
  user_id?: string;
  access_token: string;
};

export type CreateUserResponseType = Omit<
  CreateUserParamsType,
  'access_token'
> & {
  user_id: string;
};
