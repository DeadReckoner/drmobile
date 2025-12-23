import { AppText, AppView } from '@/components/ui';
import { MessageType } from '@/store/apis/types/messagesApi.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { DateUtils } from '@/utils/date.utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MessageBubbleProps {
  message: MessageType;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { id: currentUserId } = useAppSelector(selectUser);
  const isCurrentUser = message.user_id === currentUserId;

  const formattedTime = DateUtils.formatDate(
    DateUtils.createDate(message.created_at),
    'h:mm A',
  );

  return (
    <AppView
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
      marginB-4>
      <AppView
        style={[
          styles.messageBubble,
          isCurrentUser
            ? { backgroundColor: Colors.cardBG }
            : { backgroundColor: Colors.lightCardBG },
        ]}
        padding-8>
        <AppText
          subtitle2
          regular
          style={
            isCurrentUser
              ? { color: Colors.textOnPrimary }
              : { color: Colors.textColor }
          }>
          {message.content}
        </AppText>
        <AppView marginT-4 style={{ alignSelf: 'flex-end' }}>
          <AppText
            sm
            style={[
              styles.timeText,
              isCurrentUser
                ? { color: Colors.textOnPrimary, opacity: 0.7 }
                : { color: Colors.secondary },
            ]}>
            {formattedTime}
          </AppText>
        </AppView>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    minWidth: 80,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 8,
  },
});
