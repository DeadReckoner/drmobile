import { api } from '@/store/apis/api';
import {
  CreateUserParamsType,
  CreateUserResponseType,
  DeleteUserResponseType,
  UpdateUserParamsType,
  UpdateUserResponseType,
  UpdateUserWithImageParamsType,
  UserStatsResponseType,
} from '@/store/apis/types/userApi.types';
import { setAuthUserAction } from '@/store/slices/authSlice';
import {
  completeSetupTaskAction,
  resetOnboardingFromServerAction,
} from '@/store/slices/onboardingSlice';
import { RootStateType } from '@/store/types/store.types';
import { getAppleAuthCode } from '@/utils/storage.utils';

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
    deleteUser: builder.mutation<DeleteUserResponseType, void>({
      queryFn: async (_arg, { getState }, _extraOptions, baseQuery) => {
        const state = getState() as RootStateType;
        const userId = state.auth.user.id;
        const appleAuthCode = await getAppleAuthCode();
        const params = new URLSearchParams();
        if (appleAuthCode) {
          params.append('apple_auth_code', appleAuthCode);
        }

        const result = await baseQuery({
          url: `/users/${userId}?${params.toString()}`,
          method: 'DELETE',
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as DeleteUserResponseType };
      },
    }),
    updateUserWithImage: builder.mutation<
      UpdateUserResponseType,
      UpdateUserWithImageParamsType
    >({
      queryFn: async (
        { userPayload, imageUri },
        { getState, dispatch },
        _extraOptions,
        baseQuery,
      ) => {
        const state = getState() as RootStateType;
        const { id: userId } = state.auth.user;

        const formData = new FormData();
        formData.append('user', JSON.stringify(userPayload));

        if (imageUri) {
          const filename = imageUri.split('/').pop() ?? 'profile.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const mimeType = match
            ? `image/${match[1].toLowerCase()}`
            : 'image/jpeg';
          formData.append('image', {
            uri: imageUri,
            name: filename,
            type: mimeType,
          } as unknown as Blob);
        }

        const result = await baseQuery({
          url: `/users/${userId}/with-image`,
          method: 'PATCH',
          body: formData,
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateUserResponseType;
        dispatch(
          setAuthUserAction({
            ...state.auth.user,
            avatar: data.profile_image_url ?? state.auth.user.avatar,
          }),
        );

        return { data };
      },
    }),
    deleteUserImage: builder.mutation<DeleteUserResponseType, void>({
      queryFn: async (
        _arg,
        { getState, dispatch },
        _extraOptions,
        baseQuery,
      ) => {
        const state = getState() as RootStateType;
        const { id: userId } = state.auth.user;

        const result = await baseQuery({
          url: `/users/${userId}/image`,
          method: 'DELETE',
        });

        if (result.error) {
          return { error: result.error };
        }

        dispatch(
          setAuthUserAction({
            ...state.auth.user,
            avatar: '',
          }),
        );

        return { data: result.data as DeleteUserResponseType };
      },
    }),
    updateUserTimezone: builder.mutation<
      void,
      { userId: string; timezone: string }
    >({
      query: ({ userId, timezone }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: { timezone },
      }),
    }),
    getUserStats: builder.query<UserStatsResponseType, void>({
      query: () => ({
        url: '/users/stats',
        method: 'GET',
      }),
      keepUnusedDataFor: 900,
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
              avatar: data.profile_image_url || currentUser.avatar,
            }),
          );
          if (data.onboarding_completed === true) {
            dispatch(completeSetupTaskAction());
          } else if (data.onboarding_completed === false) {
            dispatch(resetOnboardingFromServerAction());
          }
        } catch {}
      },
    }),
  }),
  overrideExisting: true,
});
