import { Env } from '@/constants/Env';
import i18nConfig from '@/lib/localization/i18nConfig';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { showToastAction } from '@/store/slices/settingsSlice';
import { RootStateType } from '@/store/types/store.types';
import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

export const ApiCacheTags = Object.freeze({
  Roadmaps: 'Roadmaps',
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
    if (result?.error?.status === 401) {
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
    return result;
  };
};

export const api = createApi({
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
});
