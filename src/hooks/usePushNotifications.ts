import { useCallback, useEffect, useState } from 'react';

import { notificationsUtils } from '@/utils/notifications.utils';
import { AppState } from 'react-native';

interface NotificationData {
  [key: string]: any;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined' | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkPermissions = useCallback(async () => {
    try {
      const status = await notificationsUtils.checkPermissions();
      setPermissionStatus(status);
    } catch {
      setPermissionStatus('denied');
    }
  }, []);

  useEffect(() => {
    checkPermissions();
    const appEventListener = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active') {
          checkPermissions();
        }
      },
    );

    return () => {
      appEventListener.remove();
    };
  }, [checkPermissions]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { granted } = await notificationsUtils.requestPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (granted) {
        const token = await notificationsUtils.getExpoPushToken();
        setExpoPushToken(token);
      }
      return granted;
    } catch {
      setPermissionStatus('denied');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: NotificationData,
      seconds: number = 1,
    ): Promise<string | null> => {
      try {
        return await notificationsUtils.scheduleNotification(
          title,
          body,
          data,
          seconds,
        );
      } catch {
        return null;
      }
    },
    [],
  );

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await notificationsUtils.cancelAllNotifications();
    } catch {}
  }, []);

  const setBadgeCount = useCallback(async (count: number): Promise<void> => {
    try {
      await notificationsUtils.setBadgeCount(count);
    } catch {}
  }, []);

  const getBadgeCount = useCallback(async (): Promise<number> => {
    try {
      return await notificationsUtils.getBadgeCount();
    } catch {
      return 0;
    }
  }, []);

  return {
    expoPushToken,
    permissionStatus,
    isLoading,
    requestPermissions,
    scheduleNotification,
    cancelAllNotifications,
    setBadgeCount,
    getBadgeCount,
  };
};
