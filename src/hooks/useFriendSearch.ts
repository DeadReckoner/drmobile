import type { Friend, FriendViewState } from '@/components/friends/types';
import {
  useGetFriendsQuery,
  useLazySearchUsersQuery,
} from '@/store/apis/friendsApi';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_DELAY = 400;

export const useFriendSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    data: friendsData,
    isLoading: isLoadingFriends,
    refetch,
    isFetching,
  } = useGetFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [searchUsers, { data: searchData, isFetching: isSearching }] =
    useLazySearchUsersQuery();

  const friends = useMemo<Friend[]>(() => {
    if (!friendsData) return [];
    return friendsData.map((friendResponse) => ({
      id: friendResponse.friend.user_id,
      name: `${friendResponse.friend.first_name} ${friendResponse.friend.last_name || ''}`,
      avatar: undefined,
      email: friendResponse.friend.email,
      friendship_status: 'accepted' as const,
    }));
  }, [friendsData]);

  const filteredFriends = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return friends;

    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(trimmedQuery) ||
        friend.email?.toLowerCase().includes(trimmedQuery),
    );
  }, [searchQuery, friends]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const timer = setTimeout(
      () => setDebouncedQuery(trimmedQuery),
      DEBOUNCE_DELAY,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  const apiSearchResults = useMemo<Friend[]>(() => {
    if (!searchData || !debouncedQuery) return [];
    const existingFriendIds = new Set(friends.map((f) => f.id));
    return searchData
      .filter((user) => !existingFriendIds.has(user.user_id))
      .map((user) => ({
        id: user.user_id,
        name: `${user.first_name} ${user.last_name || ''}`,
        avatar: undefined,
        email: user.email,
        friendship_status: user.friendship_status,
      }));
  }, [searchData, debouncedQuery, friends]);

  const viewState = useMemo<FriendViewState>(() => {
    if (isLoadingFriends) return 'LOADING';

    const hasSearchQuery = searchQuery.trim().length > 0;

    if (hasSearchQuery) {
      const hasLocalResults = filteredFriends.length > 0;
      const hasApiResults = apiSearchResults.length > 0;

      if (hasLocalResults || hasApiResults) return 'SEARCH_RESULTS';
      if (searchQuery.trim() !== debouncedQuery || isSearching)
        return 'SEARCHING';
      return 'NO_RESULTS';
    }

    if (friends.length > 0) return 'FRIENDS_LIST';
    return 'EMPTY';
  }, [
    isLoadingFriends,
    searchQuery,
    debouncedQuery,
    filteredFriends,
    apiSearchResults,
    isSearching,
    friends,
  ]);

  const onClearSearch = useCallback(() => setSearchQuery(''), []);

  return {
    searchQuery,
    onSearchChange: setSearchQuery,
    onClearSearch,
    friends,
    filteredFriends,
    apiSearchResults,
    viewState,
    isRefreshing: isFetching,
    refetch,
  };
};
