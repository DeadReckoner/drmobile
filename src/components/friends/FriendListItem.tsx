import { AppAvatar } from '@/components/AppAvatar';
import { AppCard } from '@/components/AppCard';
import { AppImage, AppText, AppView } from '@/components/ui';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

import type { Friend } from './types';

interface FriendListItemProps {
  friend: Friend;
}

const FriendListItemComponent = ({ friend }: FriendListItemProps) => {
  const handlePress = () => {
    router.navigate({
      pathname: '/settings/friend-details/[friendId]',
      params: {
        friendId: friend.id,
        friendName: friend.name,
        friendEmail: friend.email,
        friendshipStatus: friend.friendship_status || 'none',
      },
    });
  };

  return (
    <AppCard
      marginB-8
      paddingV-16
      paddingH-16
      style={styles.friendCard}
      onPress={handlePress}>
      <AppView row centerV spread>
        <AppView row centerV gap-16>
          {friend.avatar ? (
            <AppImage source={{ uri: friend.avatar }} style={styles.avatar} />
          ) : (
            <AppAvatar />
          )}
          <AppView flex gap-4>
            <AppText body2 textColor>
              {friend.name}
            </AppText>
            {friend.email && (
              <AppText xsm secondary>
                {friend.email}
              </AppText>
            )}
          </AppView>
        </AppView>
      </AppView>
    </AppCard>
  );
};

export const FriendListItem = memo(FriendListItemComponent);

const styles = StyleSheet.create({
  friendCard: {
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
