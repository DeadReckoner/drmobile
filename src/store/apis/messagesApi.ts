import { Env } from '@/constants/Env';
import { api } from '@/store/apis/api';
import {
  GetMessagesResponseType,
  GetThreadsResponseType,
} from '@/store/apis/types/messagesApi.types';

export const getWebsocketPath = (threadId: string) => {
  const url = `${Env.EXPO_PUBLIC_API_URL}/api/v1/ws/messages/${threadId}`;
  return url.replace('https://', 'wss://').replace('http://', 'ws://');
};

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getThreads: builder.query<GetThreadsResponseType, void>({
      query: () => '/threads',
      providesTags: ['Threads'],
    }),
    getThreadMessages: builder.query<GetMessagesResponseType, string>({
      query: (threadId) => `/threads/${threadId}/messages`,
      providesTags: (_result, _error, threadId) => [
        { type: 'Threads', id: `MESSAGES-${threadId}` },
      ],
    }),
    getAllUnreadMessagesCount: builder.query<number, void>({
      query: () => '/threads/unread',
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetThreadsQuery,
  useGetThreadMessagesQuery,
  useGetAllUnreadMessagesCountQuery,
} = messagesApi;
