import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { DateUtils } from '@/utils/date.utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ThreadListItemProps {
  thread: ThreadType;
  lastMessage?: string;
  onThreadClick?: (_thread: ThreadType) => void;
}

export const ThreadListItem = ({
  thread,
  lastMessage,
  onThreadClick,
}: ThreadListItemProps) => {
  const { email: currentUserEmail } = useAppSelector(selectUser);
  const { t } = useLocalization();

  const getOtherParticipantName = () => {
    const otherParticipant = thread.participants?.find(
      (participant) => participant.email !== currentUserEmail,
    );

    if (otherParticipant) {
      const fullName =
        `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim();
      return fullName || t('settings.unknown_contact');
    }

    return thread.name || t('settings.unknown_contact');
  };

  const displayName = getOtherParticipantName();

  return (
    <AppCard paddingV-16 paddingH-16 onPress={() => onThreadClick?.(thread)}>
      <AppView row centerV spread>
        <AppView row centerV gap-12 flex-1>
          <AppView bg-primary center style={styles.avatar}>
            <AppIcon
              set="AntDesign"
              name="user"
              size={20}
              color={Colors.white}
            />
          </AppView>
          <AppView flex-1 gap-4>
            <AppText body2 textColor numberOfLines={1}>
              {displayName}
            </AppText>
            {lastMessage ? (
              <AppText xsm secondary numberOfLines={1}>
                {lastMessage}
              </AppText>
            ) : (
              <TranslatedText
                xsm
                secondary
                translationKey="messages.no_messages_in_thread"
                numberOfLines={1}
              />
            )}
          </AppView>
        </AppView>
        <AppView>
          <AppText sm textColor>
            {DateUtils.formatRelativeTime(thread.updated_at)}
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
