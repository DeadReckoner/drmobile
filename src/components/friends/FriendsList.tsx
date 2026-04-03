import { AppList } from '@/components/AppList';
import { FriendResponse } from '@/hooks/friends/types/friends.types';
import { useGetFriendsQuery } from '@/store/apis/friendsApi';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { FriendEmptyState } from './FriendEmptyState';
import { FriendListItem } from './FriendListItem';
import type { Friend } from './types';

interface FriendsListProps {
  friendsData?: FriendResponse[];
}

export const FriendsList = ({ friendsData = [] }: FriendsListProps) => {
  const { refetch, isFetching } = useGetFriendsQuery();

  const friends = useMemo<Friend[]>(() => {
    return friendsData.map((r) => ({
      id: r.friend.user_id,
      name: `${r.friend.first_name} ${r.friend.last_name}`,
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
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => <FriendEmptyState key="empty" />}
    />
  );
};
