import { AppAvatar } from '@/components/AppAvatar';
import { AppCard } from '@/components/AppCard';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { DateUtils } from '@/utils/date.utils';
import React from 'react';

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
  const { email: currentUserEmail, id: currentUserId } =
    useAppSelector(selectUser);
  const { t } = useLocalization();

  const getOtherParticipantName = () => {
    const otherParticipant = thread.participants?.find(
      (participant) => participant.email !== currentUserEmail,
    );

    if (otherParticipant) {
      const fullName =
        `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`.trim();
      return fullName;
    }
  };

  const displayName =
    thread.name || getOtherParticipantName() || t('settings.unknown_contact');

  return (
    <AppCard paddingV-16 paddingH-16 onPress={() => onThreadClick?.(thread)}>
      <AppView row spread>
        <AppView row centerV gap-12 flex-1>
          <AppAvatar size={20} />
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
        <AppView marginT-4 gap-6>
          <AppText sm textColor>
            {DateUtils.formatRelativeTime(
              thread.LastMessage?.updated_at || thread.updated_at,
            )}
          </AppText>
          {thread?.LastMessage?.user_id !== currentUserId &&
            thread?.total_unread > 0 && (
              <AppView
                flex-0
                center
                br100
                bg-error
                paddingH-4
                style={{ alignSelf: 'center', minWidth: 20, minHeight: 20 }}>
                <AppText sm semibold textColor>
                  {thread.total_unread}
                </AppText>
              </AppView>
            )}
        </AppView>
      </AppView>
    </AppCard>
  );
};
