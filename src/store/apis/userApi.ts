import { api } from '@/store/apis/api';
import {
  CreateUserParamsType,
  CreateUserResponseType,
  UpdateUserParamsType,
  UpdateUserResponseType,
} from '@/store/apis/types/userApi.types';
import { RootStateType } from '@/store/types/store.types';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<CreateUserResponseType, CreateUserParamsType>({
      query: (user) => {
        return {
          url: `/users`,
          method: 'POST',
          body: user,
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        };
      },
    }),
    updateUser: builder.mutation<UpdateUserResponseType, UpdateUserParamsType>({
      queryFn: async (user, { getState }, _extraOptions, baseQuery) => {
        const state = getState() as RootStateType;
        const userId = state.auth.user.id;

        const result = await baseQuery({
          url: `/users/${userId}`,
          method: 'PATCH',
          body: user,
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as UpdateUserResponseType };
      },
    }),
  }),
  overrideExisting: true,
});
