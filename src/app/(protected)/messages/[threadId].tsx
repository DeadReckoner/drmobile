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
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';
import { Colors } from 'react-native-ui-lib';

const ThreadDetailsScreen = () => {
  const { threadId, threadName } = useLocalSearchParams<{
    threadId: string;
    threadName: string;
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

  const handleMenuPress = () => {
    // TODO: Implement menu functionality
  };

  return (
    <KeyboardGestureArea style={styles.container} interpolator="ios">
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <AppScreen paddingH-0 safeArea>
          <AppView paddingH-16 bg-screenBG marginB-16>
            <AppView row centerV spread>
              <AppView flex-1>
                <HeaderWithBack
                  headerText={threadName || t('settings.unknown_contact')}
                />
              </AppView>
              <AppButton onPress={handleMenuPress}>
                <AppIcon
                  set="Feather"
                  name="more-vertical"
                  size={24}
                  color={Colors.textColor}
                />
              </AppButton>
            </AppView>
          </AppView>
          {isLoading ? (
            <AppView flex-1 center>
              <Loader transparent />
            </AppView>
          ) : (
            <AppList<MessageType>
              data={messages || []}
              renderItem={renderMessage}
              keyExtractor={(item) => item.message_id}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              alignItemsAtEnd
              initialScrollIndex={
                messages?.length > 0 ? messages.length - 1 : 0
              }
              maintainScrollAtEnd
              maintainScrollAtEndThreshold={0.1}
              ListEmptyComponent={() => (
                <AppView flex-1 center paddingT-40>
                  <TranslatedText
                    body2
                    secondary
                    translationKey="messages.no_messages_yet"
                  />
                </AppView>
              )}
            />
          )}
          <MessageComposer onSend={handleSendMessage} disabled={!isConnected} />
        </AppScreen>
      </KeyboardAvoidingView>
    </KeyboardGestureArea>
  );
};

export default ThreadDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
