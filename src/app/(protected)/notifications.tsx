import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { AnchorRequestItem } from '@/components/notifications/AnchorRequestItem';
import { FriendRequestItem } from '@/components/notifications/FriendRequestItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { AnchorRequest, Friendship } from '@/hooks/friends/types/friends.types';
import { useGetNotificationsQuery } from '@/hooks/notifications';
import {
  useAcceptAnchorRequestMutation,
  useGetMyAnchorRequestsQuery,
  useRejectAnchorRequestMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/useToast';
import {
  useAcceptFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@/store/apis/friendsApi';
import { NotificationType } from '@/store/apis/types/notificationsApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface NotificationItem {
  id: string;
  type:
    | 'friend_request'
    | 'anchor_request'
    | 'notification'
    | 'roadmap_complete';
  data: Friendship | AnchorRequest | NotificationType | { roadmap_id: string };
}

const Notifications = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const currentUser = useAppSelector(selectUser);
  const [processingIds, setProcessingIds] = useState<{
    [key: string]: 'accept' | 'cancel';
  }>({});

  const { permissionStatus, requestPermissions } = usePushNotifications();
  const { data: notifications, refetch: refetchNotifications } =
    useGetNotificationsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const {
    data: pendingRequestsData,
    isLoading,
    refetch: refetchPendingFriendRequests,
  } = useGetPendingFriendRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: anchorRequestsData,
    isLoading: isLoadingAnchorRequests,
    refetch: refetchAnchorRequests,
  } = useGetMyAnchorRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const [acceptAnchorRequest] = useAcceptAnchorRequestMutation();
  const [rejectAnchorRequest] = useRejectAnchorRequestMutation();

  const friendRequests = useMemo<Friendship[]>(() => {
    if (!pendingRequestsData || !currentUser) return [];
    return pendingRequestsData.filter(
      (friendship) =>
        friendship.status === 'pending' &&
        friendship.requester_id !== currentUser.id,
    );
  }, [pendingRequestsData, currentUser]);

  const notificationsList = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    friendRequests.forEach((request) => {
      items.push({
        id: `friend_request_${request.id}`,
        type: 'friend_request',
        data: request,
      });
    });

    if (anchorRequestsData && Array.isArray(anchorRequestsData)) {
      anchorRequestsData.forEach((request: AnchorRequest) => {
        items.push({
          id: `anchor_request_${request.request_id}`,
          type: 'anchor_request',
          data: request,
        });
      });
    }

    if (notifications && Array.isArray(notifications)) {
      notifications.forEach((notification: NotificationType) => {
        items.push({
          id: `notification_${notification.notification_id}`,
          type: 'notification',
          data: notification,
        });
      });
    }

    return items;
  }, [friendRequests, anchorRequestsData, notifications]);

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

  const handleAcceptAnchor = useCallback(
    async (requestId: string) => {
      try {
        setProcessingIds((prev) => ({ ...prev, [requestId]: 'accept' }));
        await acceptAnchorRequest(requestId).unwrap();
        showToast({
          message: t('notifications.anchor_request_accepted'),
          type: 'success',
        });
      } catch {
        showToast({
          message: t('common.something_went_wrong'),
          type: 'failure',
        });
        setProcessingIds((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    },
    [acceptAnchorRequest, showToast, t],
  );

  const handleRejectAnchor = useCallback(
    async (requestId: string) => {
      try {
        setProcessingIds((prev) => ({ ...prev, [requestId]: 'cancel' }));
        await rejectAnchorRequest(requestId).unwrap();
        showToast({
          message: t('notifications.anchor_request_rejected'),
          type: 'success',
        });
      } catch {
        showToast({
          message: t('common.something_went_wrong'),
          type: 'failure',
        });
        setProcessingIds((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    },
    [rejectAnchorRequest, showToast, t],
  );

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchNotifications(),
        refetchPendingFriendRequests(),
        refetchAnchorRequests(),
      ]);
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchNotifications,
    refetchPendingFriendRequests,
    refetchAnchorRequests,
  ]);

  const onNotificationPress = useCallback(
    (notification: NotificationType) => {
      if (notification.type === 'roadmap_complete') {
        const notificationData = notification.data as { roadmap_id: string };
        dispatch(
          setDraftRoadmapAction({
            roadmap_id: notificationData.roadmap_id,
            goal: '',
            description: '',
            days: 0,
            completed: false,
            start_date: '',
            milestones: [],
            reason: '',
          }),
        );
        router.navigate('/roadmap/roadmap-details');
      }
    },
    [dispatch],
  );

  const renderFriendRequestItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      if (item.type === 'friend_request') {
        const friendship = item.data as Friendship;
        const processingState = processingIds[friendship.id];
        return (
          <FriendRequestItem
            notification={friendship}
            onAccept={handleAccept}
            onCancel={handleCancel}
            isAccepting={processingState === 'accept'}
            isCancelling={processingState === 'cancel'}
          />
        );
      }

      if (item.type === 'anchor_request') {
        const anchorRequest = item.data as AnchorRequest;
        const processingState = processingIds[anchorRequest.request_id];
        return (
          <AnchorRequestItem
            notification={anchorRequest}
            onAccept={handleAcceptAnchor}
            onReject={handleRejectAnchor}
            isAccepting={processingState === 'accept'}
            isRejecting={processingState === 'cancel'}
          />
        );
      }

      const notification = item.data as NotificationType;
      return (
        <AppCard padding-16 onPress={() => onNotificationPress(notification)}>
          <AppView row gap-12 centerV>
            <AppView bg-outline br100 style={styles.iconContainer} center>
              <AppIcon name="notification" size={20} color={Colors.textColor} />
            </AppView>
            <AppView flex>
              <AppText textColor body2 medium marginB-4>
                {notification.title}
              </AppText>
              <AppText textColor caption secondary>
                {notification.body}
              </AppText>
            </AppView>
          </AppView>
        </AppCard>
      );
    },
    [
      processingIds,
      handleAccept,
      handleCancel,
      handleAcceptAnchor,
      handleRejectAnchor,
      onNotificationPress,
    ],
  );

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

  const renderEmptyComponent = () => {
    if (isLoading || isLoadingAnchorRequests) {
      return (
        <AppView style={styles.emptyContainer}>
          <Loader transparent />
        </AppView>
      );
    }

    return (
      <AppView style={styles.emptyContainer}>
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
  };

  return (
    <AppScreen safeArea>
      <AppView marginB-16>
        <HeaderWithBack headerKey="notifications.title" />
        {permissionStatus != null && permissionStatus !== 'granted' && (
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
      <Animated.FlatList
        data={notificationsList}
        contentInsetAdjustmentBehavior="always"
        renderItem={renderFriendRequestItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <Divider margin-4 />}
        ListEmptyComponent={renderEmptyComponent}
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
  iconContainer: {
    width: 40,
    height: 40,
  },
});
