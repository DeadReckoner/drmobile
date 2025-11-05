import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppTextField, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { Animations } from '@/utils/animation.utils';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

// Mock data for friends list
const FRIENDS_DATA = [
  { id: '1', name: 'Lucas Bennet', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Olivia Reed', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Ethan Hunt', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Jesse Pinkman', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '6', name: 'Nate Foster', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: '7', name: 'Lucas Bennet', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: '8', name: 'Olivia Reed', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: '9', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '10', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '11', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '12', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '13', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '14', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '15', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '16', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '17', name: 'Jessica Reed', avatar: 'https://i.pravatar.cc/150?img=9' },
];

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

const DEBOUNCE_DELAY = 2000;
const API_SEARCH_DELAY = 500;

const MyFriends = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showApiResults, setShowApiResults] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter local friends
  const filteredFriends = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return FRIENDS_DATA;

    return FRIENDS_DATA.filter((friend) =>
      friend.name.toLowerCase().includes(trimmedQuery),
    );
  }, [searchQuery]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced API search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedQuery = searchQuery.trim();

    // Reset state if no query
    if (!trimmedQuery) {
      setShowApiResults(false);
      setApiSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Only trigger API search if there's a query and no local results
    if (filteredFriends.length === 0) {
      setIsSearching(true);
      setShowApiResults(false);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          // TODO: Replace with your actual API endpoint
          // const response = await fetch(`/api/users/search?q=${encodeURIComponent(trimmedQuery)}`);
          // const data = await response.json();
          // setApiSearchResults(data.users || []);

          // Mock API call for demonstration
          await new Promise((resolve) => setTimeout(resolve, API_SEARCH_DELAY));

          // Mock API results
          const mockApiResults: Friend[] = [
            {
              id: 'api-1',
              name: `${trimmedQuery} Smith`,
              avatar: 'https://i.pravatar.cc/150?img=20',
            },
            {
              id: 'api-2',
              name: `${trimmedQuery} Johnson`,
              avatar: 'https://i.pravatar.cc/150?img=21',
            },
          ];

          setApiSearchResults(mockApiResults);
          setShowApiResults(true);
        } catch {
          // TODO: Implement proper error handling/logging
          setApiSearchResults([]);
          setShowApiResults(false);
        } finally {
          setIsSearching(false);
        }
      }, DEBOUNCE_DELAY);
    } else {
      // Has local results, no need to search API
      setShowApiResults(false);
      setApiSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, filteredFriends.length]);

  const onQrCodePress = useCallback(() => {
    // TODO: Handle QR code button press
    setIsVisible(true);
  }, []);

  const onInboxPress = useCallback(() => {
    // TODO: Handle inbox button press
  }, []);

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => (
      <AppCard marginB-8 paddingV-12 paddingH-12 style={styles.friendCard}>
        <AppView row centerV spread>
          <AppView row centerV gap-12>
            <AppImage source={{ uri: item.avatar }} style={styles.avatar} />
            <AppText body2 textColor>
              {item.name}
            </AppText>
          </AppView>
        </AppView>
      </AppCard>
    ),
    [],
  );

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
  const [visible, setIsVisible] = useState(false);

  return (
    <AppScreen paddingH-0>
      <AppView style={styles.container}>
        <AppView paddingH-16>
          <AppView spread row>
            <HeaderWithBack headerKey="settings.my_friends" />
            <AppView row gap-16>
              <AppButton onPress={onQrCodePress}>
                <AppIcon name="qrcode" />
              </AppButton>
              <AppButton onPress={onInboxPress}>
                <AppIcon set="Feather" name="inbox" />
              </AppButton>
            </AppView>
          </AppView>
          <AppView marginV-16>
            <AppCard paddingV-12 paddingH-12 style={styles.searchCard}>
              <AppView row centerV spread>
                <AppView row centerV gap-12>
                  <AppIcon name="search1" size={20} color={Colors.textColor} />
                  <AppTextField
                    color={Colors.textColor}
                    body2
                    placeholder={t('settings.search_friend')}
                    placeholderTextColor={Colors.secondary}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
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
        <AppView
          flex
          paddingH-16
          reanimated
          layout={Animations.Layout.Springify()}>
          {isSearching && (
            <AppView
              key="loading"
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}
              style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </AppView>
          )}
          {!isSearching && filteredFriends.length > 0 && (
            <>
              {searchQuery.trim() &&
                sectionHeader(t('settings.my_friends') || 'My Friends')}
              <Animated.FlatList
                key="local-friends"
                layout={Animations.Layout.Springify()}
                entering={Animations.Entry.FadeInDownWithSpring(300)}
                exiting={Animations.Exit.FadeOutDown()}
                data={filteredFriends}
                contentInsetAdjustmentBehavior="always"
                renderItem={renderFriendItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
          {!isSearching && showApiResults && apiSearchResults.length > 0 && (
            <Animated.FlatList
              key="api-results"
              layout={Animations.Layout.Springify()}
              entering={Animations.Entry.FadeIn()}
              exiting={Animations.Exit.FadeOutDown()}
              data={apiSearchResults}
              contentInsetAdjustmentBehavior="always"
              renderItem={renderFriendItem}
              keyExtractor={keyExtractor}
              ListHeaderComponent={sectionHeader('Search Results')}
              showsVerticalScrollIndicator={false}
            />
          )}
          {!isSearching &&
            searchQuery.trim() &&
            filteredFriends.length === 0 &&
            !showApiResults && (
              <AppView
                reanimated
                key="no-results"
                entering={Animations.Entry.FadeInDownWithSpring()}
                exiting={Animations.Exit.FadeOutDown()}
                style={{ alignItems: 'center', paddingVertical: 40 }}>
                <AppIcon name="user" size={48} color={Colors.secondary} />
                <AppText marginT-16 secondary>
                  No friends found
                </AppText>
              </AppView>
            )}
        </AppView>
      </AppView>
      <AppModal visible={visible} setIsVisible={setIsVisible}>
        <AppView padding-32 centerH gap-24>
          <TranslatedText
            subtitle1
            center
            translationKey="common.scan_qr_code"
          />
          {/* TODO: Add proper QR code */}
          <AppIcon name="qrcode" size={200} color={Colors.white} />
        </AppView>
      </AppModal>
    </AppScreen>
  );
};

export default MyFriends;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
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
});
