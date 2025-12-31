import { Env } from '@/constants/Env';
import i18nConfig from '@/lib/localization/i18nConfig';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { showToastAction } from '@/store/slices/settingsSlice';
import { RootStateType } from '@/store/types/store.types';
import { isTokenError, refreshUserSession } from '@/utils/auth.utils';
import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

export const ApiCacheTags = Object.freeze({
  Roadmaps: 'Roadmaps',
  Friends: 'Friends',
  Threads: 'Threads',
  Tasks: 'Tasks',
  AnchorRequests: 'AnchorRequests',
  Notifications: 'Notifications',
  FriendsRequests: 'FriendsRequests',
});

const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: `${Env.EXPO_PUBLIC_API_URL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootStateType).auth.user.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const createBaseQueryWithReauth = () => {
  return async (
    args: FetchArgs | string,
    apiQuery: BaseQueryApi,
    extraOptions: object,
  ) => {
    const result = await baseQueryWithReauth(args, apiQuery, extraOptions);

    const errorData = result?.error?.data as unknown;
    const status =
      typeof result?.error?.status === 'number' ? result.error.status : 0;
    const hasTokenError = isTokenError(status, errorData);

    if (hasTokenError) {
      try {
        const newSession = await refreshUserSession();

        if (newSession?.access_token) {
          const retryResult = await baseQueryWithReauth(
            args,
            apiQuery,
            extraOptions,
          );
          return retryResult;
        } else {
          throw new Error('Session refresh failed');
        }
      } catch {
        apiQuery.dispatch(api.util.resetApiState());
        apiQuery.dispatch(
          showToastAction({
            toastProps: {
              type: 'failure',
              message: i18nConfig.t('authentication.errors.session_expired'),
            },
          }),
        );
        supabaseClient.auth
          .signOut()
          .then(() => {})
          .catch(() => {});
      }
    }
    return result;
  };
};

export const api = createApi({
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
  keepUnusedDataFor: 86400,
});
