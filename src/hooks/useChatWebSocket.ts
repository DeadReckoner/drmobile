import { useWebSocket } from '@/hooks/useWebSocket';
import { messagesApi } from '@/store/apis/messagesApi';
import {
  MessageType,
  WebSocketMessageType,
} from '@/store/apis/types/messagesApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useCallback } from 'react';

interface UseChatWebSocketOptions {
  threadId: string;
  enabled?: boolean;
}

interface UseChatWebSocketReturn {
  sendMessage: (_content: string) => void;
  isConnected: boolean;
}

export const useChatWebSocket = ({
  threadId,
  enabled = true,
}: UseChatWebSocketOptions): UseChatWebSocketReturn => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleWebSocketMessage = useCallback(
    (data: unknown) => {
      const message = data as WebSocketMessageType;

      dispatch(
        messagesApi.util.updateQueryData(
          'getThreadMessages',
          threadId,
          (draft) => {
            if (!draft) return;

            const optimisticIndex = draft.findIndex(
              (msg) =>
                msg.message_id.startsWith('temp-') &&
                msg.content === message.content &&
                msg.user_id === message.user_id,
            );

            if (optimisticIndex !== -1) {
              const optimisticMsg = draft[optimisticIndex];
              optimisticMsg.message_id = message.message_id;
              optimisticMsg.created_at = message.created_at;
              optimisticMsg.updated_at = message.created_at;
            } else {
              const isDuplicate = draft.some(
                (msg) => msg.message_id === message.message_id,
              );

              if (!isDuplicate) {
                draft.push({
                  ...message,
                  updated_at: message.created_at,
                  deleted_at: null,
                });
              }
            }
          },
        ),
      );
    },
    [dispatch, threadId],
  );

  const { sendMessage: wsSendMessage, isConnected } = useWebSocket({
    threadId,
    onMessage: handleWebSocketMessage,
    enabled,
  });

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      const optimisticMessage: MessageType = {
        message_id: `temp-${Date.now()}`,
        thread_id: threadId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: null,
        deleted_at: null,
      };

      dispatch(
        messagesApi.util.updateQueryData(
          'getThreadMessages',
          threadId,
          (draft) => {
            if (!draft) {
              draft = [];
            }
            draft.push(optimisticMessage);
          },
        ),
      );

      wsSendMessage(content.trim());
    },
    [dispatch, threadId, user.id, wsSendMessage],
  );

  return {
    sendMessage,
    isConnected,
  };
};
