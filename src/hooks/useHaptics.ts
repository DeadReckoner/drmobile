import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectHapticsEnabled } from '@/store/slices/settingsSlice';
import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const hapticsEnabled = useAppSelector(selectHapticsEnabled);

  const impactAsync = async (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
  ) => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(style);
    }
  };

  const notificationAsync = async (
    type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType
      .Success,
  ) => {
    if (hapticsEnabled) {
      await Haptics.notificationAsync(type);
    }
  };

  const selectionAsync = async () => {
    if (hapticsEnabled) {
      await Haptics.selectionAsync();
    }
  };

  return {
    hapticsEnabled,
    impactAsync,
    notificationAsync,
    selectionAsync,
  };
};
