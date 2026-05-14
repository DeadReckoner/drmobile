export type CreateUserParamsType = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  access_token: string;
};

export type CreateUserResponseType = CreateUserParamsType & {
  user_id: string;
  CreatedAt: string;
};

export type UpdateUserParamsType = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;

  email?: string;
};

export type UpdateUserResponseType = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  CreatedAt: string;
};
