import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { FriendRequestData } from '@/store/apis/types/notificationsApi.types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface FriendRequestItemProps {
  notification: FriendRequestData;
  onAccept: (_friendshipId: string) => void;
  onCancel: (_friendshipId: string) => void;
  isAccepting: boolean;
  isCancelling: boolean;
  description?: string;
}

export const FriendRequestItem = ({
  notification,
  onAccept,
  onCancel,
  isAccepting,
  isCancelling,
  description,
}: FriendRequestItemProps) => {
  const isLoading = isAccepting || isCancelling;

  return (
    <AppCard padding-16 paddingV-20 flex>
      <AppView row gap-16 centerV flex>
        <AppAvatar size={20} />
        <AppView gap-10 flex>
          <AppText body2 textColor style={styles.textContainer}>
            {description}
          </AppText>
          <AppView row gap-8>
            <AppButton
              paddingV-8
              paddingH-16
              center
              br20
              style={{ backgroundColor: Colors.blue }}
              disabled={isLoading}
              onPress={() => onAccept(notification.friendship_id)}>
              {isAccepting ? (
                <AppView paddingH-16>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
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
              onPress={() => onCancel(notification.friendship_id)}>
              {isCancelling ? (
                <AppView paddingH-12>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
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
