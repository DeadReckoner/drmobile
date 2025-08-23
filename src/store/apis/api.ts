import { Env } from '@/constants/Env';
import { RootStateType } from '@/store/types/store.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ApiCacheTags = Object.freeze({
  Roadmaps: 'Roadmaps',
});

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: Env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootStateType).auth.user.access_token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
});
