export type CreateUserParamsType = {
  first_name: string;
  last_name: string;
  email: string;
};

export type CreateUserResponseType = CreateUserParamsType & {
  user_id: string;
};
