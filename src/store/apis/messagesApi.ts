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
      merge: (currentCache, newItems) => {
        // Identify WebSocket messages in the current cache that are NOT
        // in the server response (sent/received while the request was in-flight).
        const serverMessageIds = new Set(newItems.map((m) => m.message_id));
        const wsOnlyMessages = currentCache.filter(
          (msg) => !serverMessageIds.has(msg.message_id),
        );

        // Replace cache with server data, then append the WS-only messages
        currentCache.length = 0;
        currentCache.push(...newItems);
        if (wsOnlyMessages.length > 0) {
          currentCache.push(...wsOnlyMessages);
        }
      },
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
