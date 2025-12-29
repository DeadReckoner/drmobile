import { useCallback, useEffect, useState } from 'react';

import { useAddNotificationTokenMutation } from '@/hooks/notifications';
import { notificationsUtils } from '@/utils/notifications.utils';
import {
  isTokenSubmitted,
  markTokenAsSubmitted,
  saveExpoPushToken,
} from '@/utils/storage.utils';
import * as Device from 'expo-device';
import { AppState, Platform } from 'react-native';

interface NotificationData {
  [key: string]: any;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined' | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addNotificationToken] = useAddNotificationTokenMutation();

  const submitTokenToBackend = useCallback(
    async (token: string) => {
      try {
        const alreadySubmitted = await isTokenSubmitted(token);
        if (alreadySubmitted) {
          return;
        }

        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        const deviceId = Device.osBuildId || Device.modelId || 'unknown';

        await addNotificationToken({
          expo_token: token,
          platform,
          device_id: deviceId,
        }).unwrap();

        await markTokenAsSubmitted(token);
      } catch {}
    },
    [addNotificationToken],
  );

  const checkPermissions = useCallback(async () => {
    try {
      const status = await notificationsUtils.checkPermissions();
      setPermissionStatus(status);
      return status;
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
      const checkResult = await checkPermissions();
      if (checkResult === 'granted') {
        setIsLoading(false);
        return true;
      }
      const { granted } = await notificationsUtils.requestPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (granted) {
        const token = await notificationsUtils.getExpoPushToken();
        if (!token) return granted;
        setExpoPushToken(token);
        await saveExpoPushToken(token);
        await submitTokenToBackend(token);
      }
      return granted;
    } catch {
      setPermissionStatus('denied');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [submitTokenToBackend, checkPermissions]);

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
