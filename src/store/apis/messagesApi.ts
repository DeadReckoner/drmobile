import { api } from '@/store/apis/api';
import {
  GetMessagesResponseType,
  GetThreadsResponseType,
} from '@/store/apis/types/messagesApi.types';

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getThreads: builder.query<GetThreadsResponseType, void>({
      query: () => ({
        url: '/threads',
        method: 'GET',
      }),
      keepUnusedDataFor: 300,
    }),
    getThreadMessages: builder.query<GetMessagesResponseType, string>({
      query: (threadId) => ({
        url: `/threads/${threadId}/messages`,
        method: 'GET',
      }),
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: true,
});

export const { useGetThreadsQuery, useGetThreadMessagesQuery } = messagesApi;
