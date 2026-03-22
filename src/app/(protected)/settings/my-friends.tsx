import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppTextField, AppView } from '@/components/ui';
import { Env } from '@/constants/Env';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useGetFriendsQuery,
  useLazySearchUsersQuery,
} from '@/store/apis/friendsApi';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  friendship_status?: 'none' | 'pending' | 'accepted';
}

const DEBOUNCE_DELAY = 400;

const MyFriends = () => {
  const { t } = useLocalization();
  const { id } = useAppSelector(selectUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<Friend[]>([]);
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false);
  const { showToast } = useToast();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      name: `${friendResponse.friend.first_name} ${friendResponse.friend.last_name}`,
      avatar: undefined,
      email: friendResponse.friend.email,
      friendship_status: 'accepted', // Existing friends are always accepted
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
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchData) {
      const existingFriendIds = new Set(friends.map((f) => f.id));
      const transformedResults: Friend[] = (searchData || [])
        .filter((user) => !existingFriendIds.has(user.user_id))
        .map((user) => ({
          id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          avatar: undefined,
          email: user.email,
          friendship_status: user.friendship_status,
        }));
      setApiSearchResults(transformedResults);
    } else {
      setApiSearchResults([]);
    }
  }, [searchData, friends]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setApiSearchResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await searchUsers(trimmedQuery);
      } catch {
        setApiSearchResults([]);
      }
    }, DEBOUNCE_DELAY);
  }, [searchQuery, searchUsers]);

  const onQrCodePress = useCallback(() => {
    setIsQRCodeModalVisible(true);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const message = t('settings.invite_message', {
        appStoreUrl: Env.EXPO_PUBLIC_STORE_UNIVERSAL_LINK,
      });

      await Share.share({ message });
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({
          message: t('settings.invite_failed'),
          type: 'failure',
        });
      }
    }
  }, [showToast, t]);

  const onInboxPress = useCallback(() => {
    handleShare();
  }, [handleShare]);

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const renderFriendItem = useCallback(({ item }: { item: Friend }) => {
    return (
      <AppCard
        marginB-8
        paddingV-16
        paddingH-16
        style={styles.friendCard}
        onPress={() => {
          router.navigate({
            pathname: '/settings/friend-details/[friendId]',
            params: {
              friendId: item.id,
              friendName: item.name,
              friendEmail: item.email,
              friendshipStatus: item.friendship_status || 'none',
            },
          });
        }}>
        <AppView row centerV spread>
          <AppView row centerV gap-16>
            {item.avatar ? (
              <AppImage source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <AppAvatar />
            )}
            <AppView flex gap-4>
              <AppText body2 textColor>
                {item.name}
              </AppText>
              {item.email && (
                <AppText xsm secondary>
                  {item.email}
                </AppText>
              )}
            </AppView>
          </AppView>
        </AppView>
      </AppCard>
    );
  }, []);

  const sectionHeader = (title: string) => (
    <AppView
      reanimated
      entering={Animations.Entry.FadeIn()}
      exiting={Animations.Exit.FadeOutDown()}
      style={{ marginTop: 16, marginBottom: 8 }}>
      <AppText body2 secondary>
        {title}
      </AppText>
    </AppView>
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const getViewState = useCallback(() => {
    const hasSearchQuery = searchQuery.trim().length > 0;

    if (isLoadingFriends) {
      return 'LOADING';
    }

    if (isSearching) {
      return 'SEARCHING';
    }

    if (hasSearchQuery) {
      const hasLocalResults = filteredFriends.length > 0;
      const hasApiResults = apiSearchResults.length > 0;

      if (hasLocalResults || hasApiResults) {
        return 'SEARCH_RESULTS';
      }
      return 'NO_RESULTS';
    }

    if (friends.length > 0) {
      return 'FRIENDS_LIST';
    }

    return 'EMPTY';
  }, [
    isLoadingFriends,
    isSearching,
    searchQuery,
    filteredFriends,
    apiSearchResults,
    friends,
  ]);

  const viewState = getViewState();

  const renderContent = () => {
    switch (viewState) {
      case 'LOADING':
      case 'SEARCHING':
        return (
          <AppView
            key="loading"
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring(300)}
            exiting={Animations.Exit.FadeOutDown()}
            style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </AppView>
        );

      case 'FRIENDS_LIST':
        return (
          <Animated.FlatList
            key="all-friends"
            layout={Animations.Layout.Springify()}
            entering={Animations.Entry.FadeInDownWithSpring(300)}
            exiting={Animations.Exit.FadeOutDown()}
            data={friends}
            contentInsetAdjustmentBehavior="always"
            renderItem={renderFriendItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        );

      case 'SEARCH_RESULTS':
        return (
          <>
            {filteredFriends.length > 0 && (
              <>
                {sectionHeader(t('settings.my_friends'))}
                <Animated.FlatList
                  key="local-friends"
                  layout={Animations.Layout.Springify()}
                  entering={Animations.Entry.FadeInDownWithSpring(500)}
                  exiting={Animations.Exit.FadeOutDown()}
                  data={filteredFriends}
                  contentInsetAdjustmentBehavior="always"
                  renderItem={renderFriendItem}
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </>
            )}

            {apiSearchResults.length > 0 && (
              <Animated.FlatList
                key="api-results"
                layout={Animations.Layout.Springify()}
                entering={Animations.Entry.FadeInDownWithSpring(500)}
                exiting={Animations.Exit.FadeOutDown()}
                data={apiSearchResults}
                contentInsetAdjustmentBehavior="always"
                renderItem={renderFriendItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={sectionHeader(
                  t('settings.search_results'),
                )}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </>
        );

      case 'NO_RESULTS':
      case 'EMPTY':
        return (
          <AppView
            reanimated
            key="no-results"
            entering={Animations.Entry.FadeInDownWithSpring(500)}
            exiting={Animations.Exit.FadeOutDown()}
            style={{ alignItems: 'center', paddingVertical: 40 }}>
            <AppIcon name="user" size={48} color={Colors.secondary} />
            <TranslatedText
              marginT-16
              secondary
              translationKey="settings.no_friends_found"
            />
          </AppView>
        );

      default:
        return null;
    }
  };

  return (
    <AppScreen paddingH-0 safeArea>
      <AppView style={styles.container}>
        <AppView paddingH-16>
          <AppView spread row>
            <HeaderWithBack headerKey="settings.my_friends" />
            <AppView row gap-16>
              <AppButton onPress={onQrCodePress}>
                <AppIcon name="qrcode" />
              </AppButton>
              <AppButton onPress={onInboxPress}>
                <AppIcon set="Feather" name="user-plus" />
              </AppButton>
            </AppView>
          </AppView>
          <AppView marginV-16>
            <AppCard style={styles.searchCard} padding-8 paddingH-16>
              <AppView row centerV spread>
                <AppView row centerV gap-12 flex>
                  <AppIcon name="search1" size={20} color={Colors.textColor} />
                  <AppTextField
                    paddingV-8
                    color={Colors.textColor}
                    body2
                    placeholder={t('settings.search_friend')}
                    placeholderTextColor={Colors.secondary}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    containerStyle={{ flexGrow: 1 }}
                  />
                </AppView>
                {searchQuery.length > 0 && (
                  <AppView
                    reanimated
                    entering={Animations.Entry.FadeIn(0)}
                    exiting={Animations.Exit.FadeOut()}>
                    <AppButton onPress={handleClearSearch}>
                      <AppIcon
                        name="close"
                        size={20}
                        color={Colors.secondary}
                      />
                    </AppButton>
                  </AppView>
                )}
              </AppView>
            </AppCard>
          </AppView>
        </AppView>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}>
          <AppView
            paddingH-16
            reanimated
            layout={Animations.Layout.Springify()}>
            {renderContent()}
          </AppView>
        </ScrollView>
      </AppView>
      <AppModal
        visible={isQRCodeModalVisible}
        setIsVisible={setIsQRCodeModalVisible}>
        <AppView padding-32 centerH gap-32>
          <TranslatedText
            subtitle1
            center
            translationKey="common.scan_qr_code"
          />
          <QRCode
            value={`deadreckoner://settings/friend-details/${id}`}
            logoSize={40}
            logoBackgroundColor="transparent"
            size={Dimensions.get('screen').width / 1.5}
          />
        </AppView>
      </AppModal>
    </AppScreen>
  );
};

export default MyFriends;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchCard: {
    borderRadius: 10,
  },
  friendCard: {
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
