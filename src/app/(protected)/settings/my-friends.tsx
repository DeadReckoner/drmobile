import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import {
  FriendQRCodeModal,
  FriendsList,
  SearchFriends,
} from '@/components/friends';
import { AppView } from '@/components/ui';
import { Env } from '@/constants/Env';
import { useGetFriendsQuery } from '@/hooks/friends';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Share, StyleSheet } from 'react-native';

const MyFriends = () => {
  const { t } = useLocalization();
  const { id } = useAppSelector(selectUser);
  const { showToast } = useToast();
  const { data: friendsData = [] } = useGetFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      const message = t('settings.invite_message', {
        appStoreUrl: Env.EXPO_PUBLIC_STORE_UNIVERSAL_LINK,
      });
      await Share.share({ message });
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({ message: t('settings.invite_failed'), type: 'failure' });
      }
    }
  }, [showToast, t]);

  const handleQRCodePress = () => {
    setIsQRCodeModalVisible(true);
  };

  const handleSearchModePress = () => {
    setIsSearchMode((prev) => !prev);
  };

  const onBackPress = () =>
    router.canGoBack() ? router.back() : router.replace('/(protected)/(tabs)');

  return (
    <AppScreen paddingH-0 safeArea>
      <AppView style={styles.container}>
        <AppView flex reanimated layout={Animations.Layout.Springify()}>
          {isSearchMode ? (
            <AppView
              flex
              key="search-mode"
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring(300)}
              exiting={Animations.Exit.FadeOutDown()}>
              <SearchFriends onClose={() => setIsSearchMode(false)} />
            </AppView>
          ) : (
            <AppView
              flex
              key="normal-mode"
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring(300)}
              exiting={Animations.Exit.FadeOutDown()}>
              <AppView row spread paddingH-16 gap-8 style={styles.header}>
                <AppButton onPress={onBackPress}>
                  <AppIcon name="arrowleft" />
                </AppButton>

                <AppView
                  pointerEvents={isSearchMode ? 'none' : 'auto'}
                  style={styles.headerNormalRow}>
                  <AppView row gap-14>
                    <AppButton onPress={handleSearchModePress}>
                      <AppIcon set="Feather" name="search" />
                    </AppButton>
                    <AppButton onPress={handleQRCodePress}>
                      <AppIcon name="qrcode" />
                    </AppButton>
                    <AppButton onPress={handleShare}>
                      <AppIcon set="Feather" name="user-plus" />
                    </AppButton>
                  </AppView>
                </AppView>
              </AppView>
              <FriendsList friendsData={friendsData} />
            </AppView>
          )}
        </AppView>
      </AppView>

      <FriendQRCodeModal
        visible={isQRCodeModalVisible}
        setIsVisible={setIsQRCodeModalVisible}
        userId={id}
      />
    </AppScreen>
  );
};

export default MyFriends;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
  },
  headerNormalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
