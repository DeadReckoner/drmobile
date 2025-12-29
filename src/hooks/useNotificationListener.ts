import { notificationsUtils } from '@/utils/notifications.utils';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

notificationsUtils.setupNotificationHandler();

export const useNotificationListener = () => {
  const redirect = (_notification: Notifications.Notification) => {
    //TODO: Handle other types of notifications
    // const screen = notification.request.content.data;

    router.push('/notifications');

    (async () => {
      try {
        await Notifications.setBadgeCountAsync(0);
        await Notifications.clearLastNotificationResponseAsync();
      } catch {}
    })();
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

    return () => {
      subscriptionResponseReceived.remove();
    };
  }, []);
};
