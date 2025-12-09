import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Friendship } from '@/hooks/friends/types/friends.types';
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/useToast';
import {
  useAcceptFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@/store/apis/friendsApi';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Animations } from '@/utils/animation.utils';
import React, { useCallback, useMemo, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const Notifications = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const currentUser = useAppSelector(selectUser);
  const [processingIds, setProcessingIds] = useState<{
    [key: string]: 'accept' | 'cancel';
  }>({});

  const { permissionStatus, requestPermissions } = usePushNotifications();

  const {
    data: pendingRequestsData,
    isLoading,
    error,
    refetch,
  } = useGetPendingFriendRequestsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();

  const notifications = useMemo<Friendship[]>(() => {
    if (!pendingRequestsData || !currentUser) return [];
    return pendingRequestsData.filter(
      (friendship) =>
        friendship.status === 'pending' &&
        friendship.requester_id !== currentUser.id,
    );
  }, [pendingRequestsData, currentUser]);

  const handleAccept = useCallback(
    async (friendshipId: string) => {
      try {
        setProcessingIds((prev) => ({ ...prev, [friendshipId]: 'accept' }));
        await acceptFriendRequest(friendshipId).unwrap();
        showToast({
          message: t('notifications.friend_request_accepted'),
          type: 'success',
        });
      } catch {
        showToast({
          message: t('common.something_went_wrong'),
          type: 'failure',
        });
      } finally {
        setProcessingIds((prev) => {
          const newState = { ...prev };
          delete newState[friendshipId];
          return newState;
        });
      }
    },
    [acceptFriendRequest, showToast, t],
  );

  const handleCancel = useCallback(
    async (friendshipId: string) => {
      try {
        setProcessingIds((prev) => ({ ...prev, [friendshipId]: 'cancel' }));
        await rejectFriendRequest(friendshipId).unwrap();
        showToast({
          message: t('notifications.friend_request_rejected'),
          type: 'success',
        });
      } catch {
        showToast({
          message: t('common.something_went_wrong'),
          type: 'failure',
        });
      } finally {
        setProcessingIds((prev) => {
          const newState = { ...prev };
          delete newState[friendshipId];
          return newState;
        });
      }
    },
    [rejectFriendRequest, showToast, t],
  );

  const keyExtractor = useCallback((item: Friendship) => item.id, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderNotificationItem = useCallback(
    ({ item }: { item: Friendship }) => {
      const processingState = processingIds[item.id];
      return (
        <NotificationItem
          notification={item}
          onAccept={handleAccept}
          onCancel={handleCancel}
          isAccepting={processingState === 'accept'}
          isCancelling={processingState === 'cancel'}
        />
      );
    },
    [processingIds, handleAccept, handleCancel],
  );

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <AppView
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring(300)}
          exiting={Animations.Exit.FadeOutDown()}
          style={styles.emptyContainer}>
          <Loader transparent />
        </AppView>
      );
    }

    if (error) {
      return (
        <AppView
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring(500)}
          exiting={Animations.Exit.FadeOutDown()}
          style={styles.emptyContainer}>
          <AppIcon name="notification" size={48} color={Colors.secondary} />
          <TranslatedText
            marginT-16
            secondary
            center
            translationKey="notifications.error_loading"
          />
        </AppView>
      );
    }

    return (
      <AppView
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring(500)}
        exiting={Animations.Exit.FadeOutDown()}
        style={styles.emptyContainer}>
        <AppIcon name="notification" size={48} color={Colors.secondary} />
        <TranslatedText
          marginT-16
          secondary
          center
          translationKey="notifications.no_notifications"
        />
        <TranslatedText
          marginT-8
          caption
          secondary
          center
          translationKey="notifications.no_notifications_description"
        />
      </AppView>
    );
  }, [isLoading, error]);

  const onNotificationSettingsBannerPress = useCallback(async () => {
    try {
      if (permissionStatus === 'undetermined') {
        await requestPermissions();
        return;
      }

      await Linking.openSettings();
    } catch {
      showToast({
        message: t('common.something_went_wrong'),
        type: 'failure',
      });
    }
  }, [permissionStatus, requestPermissions, showToast, t]);

  const renderHeader = useCallback(() => {
    return (
      <AppView marginB-16>
        <HeaderWithBack headerKey="notifications.title" />
        {permissionStatus !== 'granted' && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDown()}
            exiting={Animations.Exit.FadeOutDown()}
            marginT-12>
            <AppButton
              padding-12
              br20
              row
              bg-warning
              marginT-12
              onPress={onNotificationSettingsBannerPress}>
              <AppView br-10 flex marginR-16>
                <TranslatedText
                  body2
                  regular
                  secondary
                  translationKey="notifications.enable_notifications"
                  marginB-4
                  white
                />
                <TranslatedText
                  xsm
                  secondary
                  translationKey="notifications.notifications_disabled"
                  white
                />
              </AppView>
              <AppView center marginR-8>
                <AppIcon name="notification" size={24} />
              </AppView>
            </AppButton>
          </AppView>
        )}
      </AppView>
    );
  }, [permissionStatus, onNotificationSettingsBannerPress]);

  return (
    <AppScreen>
      <Animated.FlatList
        ListHeaderComponent={renderHeader}
        contentInsetAdjustmentBehavior={'always'}
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        layout={Animations.Layout.Springify()}
        entering={Animations.Entry.FadeInDownWithSpring(300)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <Divider />}
      />
    </AppScreen>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
});
