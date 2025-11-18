import { Env } from '@/constants/Env';
import { api } from '@/store/apis/api';
import {
  GetMessagesResponseType,
  GetThreadsResponseType,
  MessageType,
  SendMessageInputType,
} from '@/store/apis/types/messagesApi.types';

export const getWebsocketPath = (threadId: string) => {
  const url = `${Env.EXPO_PUBLIC_API_URL}/api/v1/ws/messages/${threadId}`;
  return url.replace('https://', 'wss://').replace('http://', 'ws://');
};

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getThreads: builder.query<GetThreadsResponseType, void>({
      query: () => ({
        url: '/threads',
        method: 'GET',
      }),
      keepUnusedDataFor: 300,
      providesTags: ['Threads'],
    }),
    getThreadMessages: builder.query<GetMessagesResponseType, string>({
      query: (threadId) => ({
        url: `/threads/${threadId}/messages`,
        method: 'GET',
      }),
      keepUnusedDataFor: 300,
      providesTags: (_result, _error, threadId) => [
        { type: 'Threads', id: `MESSAGES-${threadId}` },
      ],
    }),
    sendMessage: builder.mutation<
      MessageType,
      { threadId: string; data: SendMessageInputType }
    >({
      queryFn: async () => {
        // This mutation is optimistic-only, WebSocket handles the actual sending
        // Return a dummy response to satisfy RTK Query
        return { data: {} as MessageType };
      },
      onQueryStarted: async (
        { threadId, data },
        { dispatch, queryFulfilled },
      ) => {
        // Optimistic update
        const patchResult = dispatch(
          messagesApi.util.updateQueryData(
            'getThreadMessages',
            threadId,
            (draft) => {
              if (!draft) {
                draft = [];
              }

              // Add optimistic message to the end
              const optimisticMessage: MessageType = {
                message_id: `temp-${Date.now()}`,
                thread_id: threadId,
                user_id: 'current-user', // Will be replaced by WebSocket response
                content: data.content,
                created_at: new Date().toISOString(),
                updated_at: null,
                deleted_at: null,
              };
              draft.push(optimisticMessage);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetThreadsQuery,
  useGetThreadMessagesQuery,
  useSendMessageMutation,
} = messagesApi;
