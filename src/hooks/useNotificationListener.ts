import { messagesApi } from '@/store/apis/messagesApi';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { notificationsUtils } from '@/utils/notifications.utils';
import * as Notifications from 'expo-notifications';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

notificationsUtils.setupNotificationHandler();

export const useNotificationListener = () => {
  const dispatch = useAppDispatch();
  const path = usePathname();

  const handleNotificationProcessing = (data: { [key: string]: unknown }) => {
    switch (data?.type) {
      case 'message_new':
        handleNewMessages(data.thread_id as string);
        break;
      default:
        break;
    }
  };
  const redirect = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    handleNotificationProcessing(data);
    switch (data?.type) {
      case 'message_new':
        router.push(`/messages/${data.thread_id}`);
        break;
      default:
        router.push('/notifications');
    }

    (async () => {
      try {
        await Notifications.setBadgeCountAsync(0);
        await Notifications.clearLastNotificationResponseAsync();
      } catch {}
    })();
  };

  const handleNewMessages = (thread_id: string) => {
    if (path === `/messages/${thread_id}`) {
      return;
    }
    dispatch(
      messagesApi.util.updateQueryData('getThreads', undefined, (draft) => {
        const threadIndex = draft?.findIndex((t) => t.thread_id === thread_id);
        if (threadIndex !== undefined && threadIndex !== -1 && draft) {
          draft[threadIndex].total_unread += 1;
        }
      }),
    );
  };

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
        const data = notification.request.content.data;
        handleNotificationProcessing(data);
      },
    );

    return () => {
      subscriptionResponseReceived.remove();
      subscriptionReceived.remove();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
