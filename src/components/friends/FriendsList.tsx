import { AppList } from '@/components/AppList';
import { useGetFriendsQuery } from '@/store/apis/friendsApi';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { FriendEmptyState } from './FriendEmptyState';
import { FriendListItem } from './FriendListItem';
import type { Friend } from './types';

export const FriendsList = () => {
  const {
    refetch,
    isLoading,
    isFetching,
    data: friendsData = [],
  } = useGetFriendsQuery();

  const friends = useMemo<Friend[]>(() => {
    return friendsData.map((r) => ({
      id: r.friend.user_id,
      name: `${r.friend.first_name} ${r.friend.last_name || ''}`,
      avatar: undefined,
      email: r.friend.email,
      friendship_status: 'accepted' as const,
    }));
  }, [friendsData]);

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => <FriendListItem friend={item} />,
    [],
  );

  return (
    <AppList
      key="friends-list"
      data={friends}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || (friends?.length === 0 && isFetching)}
          onRefresh={refetch}
          tintColor={Colors.secondary}
        />
      }
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => <FriendEmptyState key="empty" />}
    />
  );
};
