import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { Friendship } from '@/hooks/friends/types/friends.types';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface FriendRequestItemProps {
  notification: Friendship;
  onAccept: (_friendshipId: string) => void;
  onCancel: (_friendshipId: string) => void;
  isAccepting: boolean;
  isCancelling: boolean;
}

export const FriendRequestItem = ({
  notification,
  onAccept,
  onCancel,
  isAccepting,
  isCancelling,
}: FriendRequestItemProps) => {
  const requesterName = notification.requester
    ? `${notification.requester.first_name} ${notification.requester.last_name}`.trim()
    : 'Unknown User';

  const isLoading = isAccepting || isCancelling;

  const { t } = useLocalization();

  return (
    <AppCard padding-16 paddingV-20 flex>
      <AppView row gap-16 centerV flex>
        <AppView bg-outline br100 style={styles.avatarPlaceholder} center>
          <AppIcon name="user" size={24} color={Colors.inverseBackground} />
        </AppView>

        <AppView gap-10 flex>
          <AppText body2 textColor style={styles.textContainer}>
            {requesterName}{' '}
            <AppText body2 textColor light>
              {t('notifications.friend_request')}.
            </AppText>
          </AppText>
          <AppView row gap-8>
            <AppButton
              paddingV-8
              paddingH-16
              center
              br20
              style={{ backgroundColor: Colors.blue }}
              disabled={isLoading}
              onPress={() => onAccept(notification.id)}>
              {isAccepting ? (
                <AppView paddingH-16>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
                    size={16}
                  />
                </AppView>
              ) : (
                <TranslatedText
                  tabLabel
                  white
                  style={styles.acceptButtonText}
                  translationKey="notifications.accept"
                />
              )}
            </AppButton>
            <AppButton
              paddingV-8
              paddingH-20
              br20
              center
              bg-error
              disabled={isLoading}
              onPress={() => onCancel(notification.id)}>
              {isCancelling ? (
                <AppView paddingH-12>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
                    size={16}
                  />
                </AppView>
              ) : (
                <TranslatedText
                  tabLabel
                  white
                  style={styles.cancelButtonText}
                  translationKey="notifications.cancel"
                />
              )}
            </AppButton>
          </AppView>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    flexWrap: 'wrap',
    maxWidth: '90%',
  },
  acceptButtonText: {
    fontSize: 12,
  },
  cancelButtonText: {
    fontSize: 12,
  },
});
