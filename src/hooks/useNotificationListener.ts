import { messagesApi } from '@/store/apis/messagesApi';
import { notificationApi } from '@/store/apis/notificationsApi';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setRequestBadgeAction } from '@/store/slices/notificationsSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { notificationsUtils } from '@/utils/notifications.utils';
import * as Notifications from 'expo-notifications';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

notificationsUtils.setupNotificationHandler();

export const useNotificationListener = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const handleNewMessages = useCallback(
    (thread_id: string, content: string) => {
      const currentRoute = `/messages/${thread_id}`;
      dispatch(
        messagesApi.util.updateQueryData('getThreads', undefined, (draft) => {
          const threadIndex = draft?.findIndex(
            (t) => t.thread_id === thread_id,
          );
          if (threadIndex !== undefined && threadIndex !== -1 && draft) {
            if (pathname !== currentRoute) {
              draft[threadIndex].total_unread += 1;
            }
            draft[threadIndex].LastMessage = {
              content: content,
              created_at: new Date().toISOString(),
              message_id: `notification-${Date.now()}`,
              thread_id: thread_id,
              user_id: '',
              deleted_at: null,
              updated_at: new Date().toISOString(),
            };
          }
        }),
      );
    },
    [dispatch, pathname],
  );

  const handleNotificationProcessing = useCallback(
    (content: Notifications.NotificationContent) => {
      const data = content.data;
      if (!data) return;
      dispatch(notificationApi.util.invalidateTags(['Notifications']));
      switch (data.type) {
        case 'message_new':
          handleNewMessages(data.thread_id as string, content.body || '');
          break;
        case 'friend_request':
        case 'anchor_request':
        case 'habit_anchor_request':
          dispatch(setRequestBadgeAction(true));
          break;
        default:
          break;
      }
    },
    [dispatch, handleNewMessages],
  );
  const redirect = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data;
      handleNotificationProcessing(notification.request.content);
      switch (data?.type) {
        case 'message_new':
          router.navigate({
            pathname: `/messages/[threadId]`,
            params: {
              threadId: data.thread_id as string,
              threadUserId: data.sender_id as string,
              threadName: notification.request.content.title || ' ',
            },
          });
          break;
        case 'follow_on_milestone_ready':
          dispatch(
            setDraftRoadmapAction({
              roadmap_id: data.roadmap_id as string,
              goal: '',
              description: '',
              days: 0,
              completed: false,
              start_date: '',
              milestones: [],
              reason: '',
            }),
          );
          router.navigate('/roadmap/roadmap-execution');
          break;
        case 'next_milestone_complete':
          dispatch(
            setDraftRoadmapAction({
              roadmap_id: data.roadmap_id as string,
              goal: '',
              description: '',
              days: 0,
              completed: false,
              start_date: '',
              milestones: [],
              reason: '',
            }),
          );
          router.navigate({
            pathname: '/roadmap/phase-milestones-tasks',
            params: { milestoneId: data.milestone_id as string },
          });
          break;
        default:
          router.navigate('/notifications');
      }

      (async () => {
        try {
          await Notifications.setBadgeCountAsync(0);
          await Notifications.clearLastNotificationResponseAsync();
        } catch {}
      })();
    },
    [handleNotificationProcessing, dispatch],
  );

  useEffect(() => {
    const appState = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        (async () => {
          try {
            dispatch(messagesApi.util.invalidateTags(['Threads']));
            await notificationsUtils.setBadgeCount(0);
          } catch {}
        })();
      }
    });

    return () => {
      appState.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last?.notification) {
          redirect(last.notification);
        }
      } catch {}
    })();
    const subscriptionResponseReceived =
      Notifications.addNotificationResponseReceivedListener((response) => {
        redirect(response.notification);
      });

    const subscriptionReceived = Notifications.addNotificationReceivedListener(
      (notification) => {
        handleNotificationProcessing(notification.request.content);
        notificationsUtils.updateBadgeCount().catch(() => {});
      },
    );

    return () => {
      subscriptionResponseReceived.remove();
      subscriptionReceived.remove();
    };
  }, [pathname, handleNotificationProcessing, redirect]);
};
