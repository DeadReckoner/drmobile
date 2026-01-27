import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AnchorRequestItem } from '@/components/notifications/AnchorRequestItem';
import { FriendRequestItem } from '@/components/notifications/FriendRequestItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetNotificationsQuery } from '@/hooks/notifications';
import {
  useAcceptAnchorRequestMutation,
  useRejectAnchorRequestMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/useToast';
import {
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from '@/store/apis/friendsApi';
import {
  AnchorAcceptedData,
  AnchorRequestData,
  FriendAcceptedData,
  FriendRequestData,
  NotificationType,
} from '@/store/apis/types/notificationsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const Notifications = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const [processingIds, setProcessingIds] = useState<{
    [key: string]: 'accept' | 'cancel';
  }>({});

  const { permissionStatus, requestPermissions } = usePushNotifications();
  const { data: notifications, refetch: refetchNotifications } =
    useGetNotificationsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const [acceptAnchorRequest] = useAcceptAnchorRequestMutation();
  const [rejectAnchorRequest] = useRejectAnchorRequestMutation();

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
      } finally {
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
      } finally {
        setProcessingIds((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    },
    [rejectAnchorRequest, showToast, t],
  );

  const keyExtractor = useCallback(
    (item: NotificationType) => item.notification_id,
    [],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([refetchNotifications()]);
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [refetchNotifications]);

  const onNotificationPress = useCallback(
    (notification: NotificationType) => {
      if (notification.type === 'roadmap_complete') {
        const notificationData = notification.data;
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

      if (notification.type === 'message_new') {
        router.navigate({
          pathname: `/messages/[threadId]`,
          params: {
            threadId: notification.data?.thread_id,
            threadName: notification.title,
            threadUserId: notification.data?.sender_id,
          },
        });
      }
      if (
        notification.type === 'anchor_accepted' ||
        notification.type === 'anchor_rejected'
      ) {
        const data = notification.data as AnchorAcceptedData;
        if (data.roadmap_id) {
          router.navigate({
            pathname: '/settings/readonly-roadmap-details',
            params: {
              roadmap: JSON.stringify({
                roadmap_id: data.roadmap_id,
              }),
            },
          });
        } else if (data.habit_id) {
          router.navigate({
            pathname: '/habits/add-edit-habits-task',
            params: {
              mode: 'edit',
              habitId: data.habit_id,
            },
          });
        }
      }

      if (
        notification.type === 'friend_accepted' ||
        notification.type === 'friend_rejected'
      ) {
        router.navigate({
          pathname: '/settings/friend-details/[friendId]',
          params: {
            friendId: (notification.data as FriendAcceptedData).addressee_id,
          },
        });
      }
    },
    [dispatch],
  );

  const renderFriendRequestItem = useCallback(
    ({ item }: { item: NotificationType }) => {
      const type = item.type;
      if (type === 'friend_request') {
        const friendship = item.data as FriendRequestData;
        const processingState = processingIds[friendship.friendship_id];
        return (
          <FriendRequestItem
            notification={friendship}
            onAccept={handleAccept}
            onCancel={handleCancel}
            isAccepting={processingState === 'accept'}
            isCancelling={processingState === 'cancel'}
            description={item.body}
          />
        );
      }

      if (type === 'anchor_request' || type === 'habit_anchor_request') {
        const anchorRequest = item.data as AnchorRequestData;
        const processingState = processingIds[anchorRequest.request_id];
        return (
          <AnchorRequestItem
            description={item.body}
            notification={anchorRequest}
            onAccept={handleAcceptAnchor}
            onReject={handleRejectAnchor}
            isAccepting={processingState === 'accept'}
            isRejecting={processingState === 'cancel'}
          />
        );
      }
      const isClickable =
        type === 'roadmap_complete' ||
        type === 'message_new' ||
        type === 'anchor_accepted' ||
        type === 'anchor_rejected' ||
        type === 'friend_accepted' ||
        type === 'friend_rejected';

      return (
        <AppCard
          padding-16
          onPress={isClickable ? () => onNotificationPress(item) : undefined}>
          <AppView row gap-12 centerV>
            <AppView bg-accent br100 style={styles.iconContainer} center>
              <AppIcon name="notification" size={20} color={Colors.textColor} />
            </AppView>
            <AppView flex>
              <AppText textColor body2 medium marginB-4>
                {item.title}
              </AppText>
              <AppText textColor caption secondary>
                {item.body}
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
        data={notifications || []}
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
