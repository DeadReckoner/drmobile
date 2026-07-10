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
  profile_image_url?: string;
  onboarding_completed?: boolean;
};

export type UpdateUserParamsType = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  onboarding_completed?: boolean;
};

export type UpdateUserWithImageParamsType = {
  userPayload: UpdateUserParamsType;
  imageUri?: string;
};

export type UpdateUserResponseType = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  CreatedAt: string;
  profile_image_url?: string;
};

export type DeleteUserResponseType = {
  message: string;
};
