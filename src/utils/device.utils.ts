import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getDeviceInfo = () => {
  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const osVersion =
    Platform.OS === 'ios'
      ? `iOS ${Device.osVersion}`
      : `Android ${Device.osVersion}`;
  const deviceModel = Device.modelName || 'Unknown';

  return {
    appVersion,
    os: osVersion,
    device: deviceModel,
  };
};
