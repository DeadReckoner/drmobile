import { api } from '@/store/apis/api';
import {
  CreateUserParamsType,
  CreateUserResponseType,
} from '@/store/apis/types/userApi.types';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<CreateUserResponseType, CreateUserParamsType>({
      query: (user) => {
        return {
          url: `/users`,
          method: 'POST',
          body: user,
        };
      },
    }),
  }),
  overrideExisting: true,
});
