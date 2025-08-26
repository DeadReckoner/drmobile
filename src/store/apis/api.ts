import { Env } from '@/constants/Env';
import { RootStateType } from '@/store/types/store.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ApiCacheTags = Object.freeze({
  Roadmaps: 'Roadmaps',
});

const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: Env.EXPO_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootStateType).auth.user?.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
});
