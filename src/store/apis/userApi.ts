import { api } from '@/store/apis/api';
import {
  CreateUserParamsType,
  CreateUserResponseType,
  UpdateUserParamsType,
  UpdateUserResponseType,
} from '@/store/apis/types/userApi.types';
import { setAuthUserAction } from '@/store/slices/authSlice';
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
    getMyProfile: builder.query<CreateUserResponseType, void>({
      query: () => ({
        url: `/users`,
        method: 'GET',
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled, getState }) => {
        const currentUser = (getState() as RootStateType).auth.user;
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuthUserAction({
              ...currentUser,
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
              email: data.email,
            }),
          );
        } catch {}
      },
    }),
  }),
  overrideExisting: true,
});
