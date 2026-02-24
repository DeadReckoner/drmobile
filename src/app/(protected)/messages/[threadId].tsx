import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { MessageDateSeparator } from '@/components/messages/MessageDateSeparator';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useLocalization } from '@/hooks/useLocalization';
import {
  messagesApi,
  useGetThreadMessagesQuery,
} from '@/store/apis/messagesApi';
import { MessageType } from '@/store/apis/types/messagesApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { DateUtils } from '@/utils/date.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Colors } from 'react-native-ui-lib';

const ThreadDetailsScreen = () => {
  const { threadId, threadName, threadUserId } = useLocalSearchParams<{
    threadId: string;
    threadName: string;
    threadUserId: string;
  }>();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const { isLoading } = useGetThreadMessagesQuery(threadId || '', {
    skip: !threadId,
    refetchOnMountOrArgChange: true,
  });

  const messages = useAppSelector(
    (state) =>
      messagesApi.endpoints.getThreadMessages.select(threadId || '')(state)
        ?.data ?? [],
  );

  const { wsSendMessage, isConnected, retryMessage } = useChatWebSocket({
    threadId: threadId || '',
    enabled: !!threadId,
  });

  const resetThreadUnreadCount = useCallback(() => {
    if (threadId) {
      dispatch(
        messagesApi.util.updateQueryData('getThreads', undefined, (draft) => {
          const threadIndex = draft?.findIndex((t) => t.thread_id === threadId);
          if (threadIndex !== undefined && threadIndex !== -1 && draft) {
            draft[threadIndex].total_unread = 0;
          }
        }),
      );
    }
  }, [dispatch, threadId]);

  useEffect(() => {
    resetThreadUnreadCount();
    return () => {
      resetThreadUnreadCount();
    };
  }, [resetThreadUnreadCount]);

  type MessageListItem =
    | { type: 'message'; data: MessageType }
    | { type: 'dateSeparator'; date: string; id: string };

  const messagesWithSeparators = useMemo((): MessageListItem[] => {
    if (!messages || messages.length === 0) return [];
    const items: MessageListItem[] = [];
    let lastDate: string | null = null;

    messages.forEach((message) => {
      const messageDate = DateUtils.formatDate(
        message.created_at,
        'MM-DD-YYYY',
      );

      if (lastDate !== messageDate) {
        items.push({
          type: 'dateSeparator',
          date: message.created_at,
          id: `separator-${messageDate}`,
        });
        lastDate = messageDate;
      }

      items.push({
        type: 'message',
        data: message,
      });
    });

    return items;
  }, [messages]);

  const handleSendMessage = useCallback(
    (messageText: string) => {
      if (!messageText?.trim() || !user?.id || !threadId) return;

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: MessageType = {
        message_id: tempId,
        thread_id: threadId,
        user_id: user.id,
        content: messageText.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        isPending: true,
      };

      dispatch(
        messagesApi.util.updateQueryData(
          'getThreadMessages',
          threadId,
          (draft) => {
            if (draft && Array.isArray(draft)) {
              draft.push(optimisticMessage);
            } else {
              return [optimisticMessage];
            }
          },
        ),
      );

      wsSendMessage(messageText.trim(), tempId);
    },
    [dispatch, threadId, user?.id, wsSendMessage],
  );

  const renderItem = ({ item }: { item: MessageListItem }) => {
    if (item.type === 'dateSeparator') {
      return <MessageDateSeparator date={item.date} />;
    }
    return <MessageBubble message={item.data} onRetry={retryMessage} />;
  };

  const handleRoadmapClick = () => {
    router.navigate({
      pathname: '/messages/allowed-roadmaps/[threadUserId]',
      params: { threadUserId: threadUserId },
    });
  };

  const renderEmptyComponent = () =>
    !isLoading && (
      <AppView flex-1 center paddingT-40>
        <TranslatedText
          body2
          secondary
          translationKey="messages.no_messages_yet"
        />
      </AppView>
    );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <AppScreen paddingH-0 safeArea>
        <AppView bg-screenBG>
          <AppView row centerV spread paddingB-4>
            <AppView flex-1 paddingL-16>
              <HeaderWithBack
                headerText={threadName || t('settings.unknown_contact')}
              />
            </AppView>
            <AppButton
              paddingV-8
              paddingH-16
              marginR-4
              onPress={handleRoadmapClick}>
              <AppIcon
                set="Feather"
                name="map"
                size={20}
                color={Colors.textColor}
              />
            </AppButton>
          </AppView>
        </AppView>
        {isLoading ? (
          <AppView height={150}>
            <Loader transparent />
          </AppView>
        ) : (
          <>
            <AppList<MessageListItem>
              data={messagesWithSeparators || []}
              renderItem={renderItem}
              keyExtractor={(item) =>
                `${item.type}-${item.type === 'message' ? item.data.message_id + item.data.content : item.id}`
              }
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              alignItemsAtEnd
              initialScrollIndex={
                messagesWithSeparators?.length > 0
                  ? messagesWithSeparators.length - 1
                  : 0
              }
              maintainScrollAtEnd
              maintainScrollAtEndThreshold={0.1}
              ListEmptyComponent={renderEmptyComponent}
            />
            <MessageComposer
              isLoading={isLoading || !isConnected}
              onSend={handleSendMessage}
              disabled={!isConnected}
            />
          </>
        )}
      </AppScreen>
    </KeyboardAvoidingView>
  );
};

export default ThreadDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
});
