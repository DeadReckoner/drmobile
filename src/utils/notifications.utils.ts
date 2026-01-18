import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const PROJECT_ID =
  Constants?.expoConfig?.extra?.eas?.projectId ??
  Constants?.easConfig?.projectId;

const checkPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

const requestPermissions = async () => {
  const existingStatus = await checkPermissions();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, status: finalStatus };
  }

  return { granted: true, status: finalStatus };
};

const getExpoPushToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });
    return token.data;
  } catch {
    return null;
  }
};

const setupAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.primary,
    });
  }
};

const scheduleNotification = async (
  title: string,
  body: string,
  data?: any,
  seconds: number = 1,
) => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
};

const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const getBadgeCount = async () => {
  return await Notifications.getBadgeCountAsync();
};

const setBadgeCount = async (count: number) => {
  await Notifications.setBadgeCountAsync(count);
};

const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const notificationsUtils = {
  checkPermissions,
  requestPermissions,
  getExpoPushToken,
  setupAndroidChannel,
  scheduleNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  setupNotificationHandler,
  onPushTokenChange: Notifications.addPushTokenListener,
};
