import { getWebsocketPath } from '@/store/apis/messagesApi';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useCallback, useEffect, useRef, useState } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
  threadId: string;
  onMessage?: (_message: unknown) => void;
  onError?: (_error: Event) => void;
  enabled?: boolean;
}

interface UseWebSocketReturn {
  sendMessage: (_content: string) => void;
  status: WebSocketStatus;
  isConnected: boolean;
}

export const useWebSocket = ({
  threadId,
  onMessage,
  onError,
  enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const user = useAppSelector(selectUser);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (!enabled || !threadId || !user.access_token) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setStatus('connecting');
      const url = getWebsocketPath(threadId);

      const ws = new WebSocket(url, null, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {}
      };

      ws.onerror = (error) => {
        onError?.(error);
        setStatus('disconnected');
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;

        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch {
      setStatus('disconnected');
    }
  }, [enabled, threadId, user.access_token, onMessage, onError]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return {
    sendMessage,
    status,
    isConnected: status === 'connected',
  };
};
