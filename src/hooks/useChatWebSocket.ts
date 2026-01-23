import { useWebSocket } from '@/hooks/useWebSocket';
import { messagesApi } from '@/store/apis/messagesApi';
import { WebSocketMessageType } from '@/store/apis/types/messagesApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { useCallback } from 'react';

interface UseChatWebSocketOptions {
  threadId: string;
  enabled?: boolean;
}

interface UseChatWebSocketReturn {
  wsSendMessage: (_content: string, _tempId: string) => void;
  isConnected: boolean;
  retryMessage: (_messageId: string) => void;
}

export const useChatWebSocket = ({
  threadId,
  enabled = true,
}: UseChatWebSocketOptions): UseChatWebSocketReturn => {
  const dispatch = useAppDispatch();

  const messages = useAppSelector(
    (state) =>
      messagesApi.endpoints.getThreadMessages.select(threadId)(state)?.data ??
      [],
  );

  const handleWebSocketMessage = useCallback(
    (data: unknown) => {
      const message = data as WebSocketMessageType;

      dispatch(
        messagesApi.util.updateQueryData(
          'getThreadMessages',
          threadId,
          (draft) => {
            if (!draft) return;

            // Find optimistic message to replace
            const optimisticIndex = draft.findIndex(
              (msg) =>
                msg.message_id.startsWith('temp-') &&
                msg.content === message.content &&
                msg.user_id === message.user_id &&
                (msg.isPending || msg.error),
            );

            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
              draft[optimisticIndex] = {
                ...message,
                updated_at: message.created_at,
                deleted_at: null,
                isPending: false,
                error: undefined,
              };
            } else {
              const isDuplicate = draft.some(
                (msg) => msg.message_id === message.message_id,
              );

              if (!isDuplicate) {
                draft.push({
                  ...message,
                  updated_at: message.created_at,
                  deleted_at: null,
                  isPending: false,
                });
              }
            }
          },
        ),
      );

      dispatch(
        messagesApi.util.updateQueryData('getThreads', undefined, (draft) => {
          if (!draft) return;

          const threadToUpdate = draft.findIndex(
            (thread) => thread.thread_id === threadId,
          );

          if (threadToUpdate !== -1) {
            draft[threadToUpdate].LastMessage = {
              ...message,
              updated_at: message.created_at,
              deleted_at: null,
            };
          }
        }),
      );
    },
    [dispatch, threadId],
  );

  const { sendMessage: wsSendMessage, isConnected } = useWebSocket({
    threadId,
    onMessage: handleWebSocketMessage,
    enabled,
  });

  const sendMessageViaWebSocket = useCallback(
    (content: string, tempId: string) => {
      try {
        if (!content?.trim() || !isConnected) return;
        wsSendMessage(content.trim());
      } catch {
        dispatch(
          messagesApi.util.updateQueryData(
            'getThreadMessages',
            threadId,
            (draft) => {
              if (!draft) return;
              const msgIndex = draft.findIndex(
                (msg) => msg?.message_id === tempId,
              );
              if (msgIndex !== -1 && draft[msgIndex]) {
                draft[msgIndex].isPending = false;
                draft[msgIndex].error = 'Send failed';
              }
            },
          ),
        );
      }
    },
    [dispatch, threadId, wsSendMessage, isConnected],
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      try {
        if (!messageId || !messages || !Array.isArray(messages)) return;

        const failedMessage = messages.find(
          (msg) => msg?.message_id === messageId && msg?.error,
        );

        if (!failedMessage || !failedMessage.content) return;

        dispatch(
          messagesApi.util.updateQueryData(
            'getThreadMessages',
            threadId,
            (draft) => {
              if (!draft) return;
              const msgIndex = draft.findIndex(
                (msg) => msg?.message_id === messageId,
              );
              if (msgIndex !== -1 && draft[msgIndex]) {
                draft[msgIndex].isPending = true;
                draft[msgIndex].error = undefined;
              }
            },
          ),
        );

        if (!isConnected) {
          setTimeout(() => {
            dispatch(
              messagesApi.util.updateQueryData(
                'getThreadMessages',
                threadId,
                (draft) => {
                  if (!draft) return;
                  const msgIndex = draft.findIndex(
                    (msg) => msg?.message_id === messageId,
                  );
                  if (msgIndex !== -1 && draft[msgIndex]) {
                    draft[msgIndex].isPending = false;
                    draft[msgIndex].error = 'Not connected';
                  }
                },
              ),
            );
          }, 100);
          return;
        }

        wsSendMessage?.(failedMessage.content);
      } catch {
        dispatch(
          messagesApi.util.updateQueryData(
            'getThreadMessages',
            threadId,
            (draft) => {
              if (!draft) return;
              const msgIndex = draft.findIndex(
                (msg) => msg?.message_id === messageId,
              );
              if (msgIndex !== -1 && draft[msgIndex]) {
                draft[msgIndex].isPending = false;
                draft[msgIndex].error = 'Send failed';
              }
            },
          ),
        );
      }
    },
    [dispatch, threadId, wsSendMessage, isConnected, messages],
  );

  return {
    wsSendMessage: sendMessageViaWebSocket,
    isConnected,
    retryMessage,
  };
};
