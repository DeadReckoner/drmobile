import { AppIcon } from '@/components/AppIcon';
import { AppText, AppTouchableOpacity, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { MessageType } from '@/store/apis/types/messagesApi.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { DateUtils } from '@/utils/date.utils';
import { Link, router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MessageBubbleProps {
  message: MessageType;
  onRetry?: (_messageId: string) => void;
}

export const MessageBubble = ({ message, onRetry }: MessageBubbleProps) => {
  const { t } = useLocalization();
  const { id: currentUserId } = useAppSelector(selectUser);
  const isCurrentUser = message.user_id === currentUserId;
  const isPending = message.isPending;
  const hasError = !!message.error;

  const formattedTime = DateUtils.formatDate(
    DateUtils.createDate(message.created_at),
    'h:mm A',
  );

  const handleRetry = () => {
    if (hasError && onRetry) {
      onRetry(message.message_id);
    }
  };

  const handleReport = () => {
    router.navigate({
      pathname: '/report',
      params: {
        messageId: message.message_id,
      },
    });
  };

  return (
    <AppView
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
      marginB-4>
      <Link
        asChild
        href={'/'}
        style={[
          styles.messageBubble,
          isCurrentUser
            ? {
                backgroundColor: hasError ? Colors.$iconDanger : Colors.accent,
              }
            : { backgroundColor: Colors.lightCardBG },
        ]}>
        <Link.Trigger>
          <AppTouchableOpacity
            disabled={!hasError}
            onPress={handleRetry}
            style={StyleSheet.flatten([
              styles.messageBubble,
              isCurrentUser
                ? {
                    backgroundColor: hasError
                      ? Colors.$iconDanger
                      : Colors.accent,
                  }
                : { backgroundColor: Colors.lightCardBG },
            ])}
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
            <AppView
              row
              marginT-4
              style={{ alignSelf: 'flex-end' }}
              centerV
              gap-4>
              <AppText
                sm
                regular
                style={[
                  styles.timeText,
                  isCurrentUser
                    ? { color: Colors.textOnPrimary }
                    : { color: Colors.secondary },
                ]}>
                {formattedTime}
              </AppText>
              {isCurrentUser && (
                <>
                  {hasError && (
                    <AppIcon
                      name="alert-circle"
                      set="Feather"
                      size={12}
                      color={Colors.textOnPrimary}
                    />
                  )}
                  {!isPending && !hasError && (
                    <AppIcon
                      name="check"
                      set="Feather"
                      size={12}
                      color={Colors.textOnPrimary}
                    />
                  )}
                </>
              )}
            </AppView>
          </AppTouchableOpacity>
        </Link.Trigger>
        <Link.Menu>
          <Link.MenuAction
            icon="exclamationmark.circle"
            destructive
            onPress={handleReport}>
            {t('settings.report')}
          </Link.MenuAction>
        </Link.Menu>
      </Link>
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
