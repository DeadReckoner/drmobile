import { Env } from '@/constants/Env';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
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
      await supabaseClient.auth.signOut();
    }
    return result;
  };
};

export const api = createApi({
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
});
