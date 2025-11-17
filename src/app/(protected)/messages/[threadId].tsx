import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetThreadMessagesQuery } from '@/store/apis/messagesApi';
import { MessageType } from '@/store/apis/types/messagesApi.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
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

  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useGetThreadMessagesQuery(
    threadId || '',
    {
      skip: !threadId,
    },
  );

  const handleSendMessage = (_messageText: string) => {
    // TODO: Implement send message functionality
  };

  const renderMessage = ({ item }: { item: MessageType }) => {
    return <MessageBubble message={item} />;
  };

  const handleMenuPress = () => {
    // TODO: Implement menu functionality
  };

  const renderHeader = () => {
    return (
      <AppView paddingH-16 bg-screenBG>
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
    );
  };

  return (
    <AppScreen paddingH-0 flex-1>
      <KeyboardGestureArea style={styles.container} interpolator="ios">
        {isLoading ? (
          <AppView flex-1 center>
            <Loader transparent />
          </AppView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages || []}
            renderItem={renderMessage}
            ListHeaderComponent={renderHeader}
            contentInsetAdjustmentBehavior="always"
            keyExtractor={(item) => item.message_id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            onLayout={() => {
              if (messages && messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            ListEmptyComponent={() => (
              <AppView flex-1 center paddingT-40>
                <TranslatedText
                  body2
                  secondary
                  translationKey="messages.no_messages_yet"
                />
              </AppView>
            )}
            ListFooterComponent={() => <AppView height={32} />}
          />
        )}
        <KeyboardAvoidingView behavior="padding">
          <MessageComposer onSend={handleSendMessage} />
        </KeyboardAvoidingView>
      </KeyboardGestureArea>
    </AppScreen>
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
