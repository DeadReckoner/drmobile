import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetThreadMessagesQuery } from '@/store/apis/messagesApi';
import { MessageType } from '@/store/apis/types/messagesApi.types';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
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

  const { data: messages = [], isLoading } = useGetThreadMessagesQuery(
    threadId || '',
    {
      skip: !threadId,
      refetchOnMountOrArgChange: true,
    },
  );

  const { sendMessage, isConnected } = useChatWebSocket({
    threadId: threadId || '',
    enabled: !!threadId,
  });

  const handleSendMessage = (messageText: string) => {
    sendMessage(messageText);
  };

  const renderMessage = ({ item }: { item: MessageType }) => {
    return <MessageBubble message={item} />;
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
        {isLoading && (
          <AppView height={150}>
            <Loader transparent />
          </AppView>
        )}
        <AppList<MessageType>
          data={messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          alignItemsAtEnd
          initialScrollIndex={messages?.length > 0 ? messages.length - 1 : 0}
          maintainScrollAtEnd
          maintainScrollAtEndThreshold={0.1}
          ListEmptyComponent={renderEmptyComponent}
        />
        <MessageComposer onSend={handleSendMessage} disabled={!isConnected} />
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
