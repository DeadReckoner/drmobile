import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { Loader } from '@/components/Loader';
import { AppTextField, AppView } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalization } from '@/hooks/useLocalization';
import { useLazySearchUsersQuery } from '@/store/apis/friendsApi';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { FriendEmptyState } from './FriendEmptyState';
import { FriendListItem } from './FriendListItem';
import { FriendSectionHeader } from './FriendSectionHeader';
import type { Friend } from './types';

interface SearchFriendsProps {
  onClose: () => void;
}

export const SearchFriends = ({ onClose }: SearchFriendsProps) => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');

  const [searchUsers, { data: searchData = [], isFetching: isSearching }] =
    useLazySearchUsersQuery();

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!debouncedQuery) return;
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  const apiSearchResults = useMemo<Friend[]>(() => {
    if (!searchData || !debouncedQuery) return [];
    return searchData.map((u) => ({
      id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      avatar: undefined, //TODO: map avatar url when available
      email: u.email,
      friendship_status: u.friendship_status,
    }));
  }, [searchData, debouncedQuery]);

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => <FriendListItem friend={item} />,
    [],
  );

  const renderEmptyState = useCallback(
    () => (
      <FriendEmptyState
        key="search-idle"
        messageKey={
          debouncedQuery?.length > 0 && apiSearchResults?.length === 0
            ? 'settings.no_friends_found'
            : 'settings.search_friends_hint'
        }
      />
    ),
    [debouncedQuery, apiSearchResults?.length],
  );

  const renderHeader = useCallback(
    () =>
      !isSearching &&
      searchQuery?.length > 0 &&
      apiSearchResults?.length > 0 ? (
        <FriendSectionHeader title={t('settings.search_results')} />
      ) : null,
    [apiSearchResults, isSearching, searchQuery, t],
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="always">
      <AppView
        flex
        row
        paddingH-12
        centerV
        style={[styles.searchContainer, { borderColor: Colors.primary }]}>
        <AppView flex row centerV gap-8>
          <AppIcon set="Feather" name="search" size={22} />
          <AppTextField
            containerStyle={styles.inputContainerStyle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('settings.search_friend')}
            placeholderTextColor={Colors.secondary}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            body2
            multiline
          />
        </AppView>
        <AppButton onPress={onClose}>
          <AppIcon name="close" size={22} />
        </AppButton>
      </AppView>
      <AppView>
        {isSearching ? (
          <Loader
            key="searching"
            transparent
            animating
            size="small"
            containerStyle={styles.inlineLoader}
          />
        ) : (
          <AppList<Friend>
            key="api-results"
            data={apiSearchResults}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </AppView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inlineLoader: {
    position: 'relative',
    paddingVertical: 40,
  },
  scrollContainer: {
    paddingVertical: 16,
  },
  inputContainerStyle: {
    flex: 1,
    paddingVertical: 14,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
});
