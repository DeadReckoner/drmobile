import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectHapticsEnabled } from '@/store/slices/settingsSlice';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export const useHaptics = () => {
  const hapticsEnabled = useAppSelector(selectHapticsEnabled);

  const impactAsync = async (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
  ) => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(style);
    }
  };

  const notificationAsync = useCallback(
    async (type: Haptics.NotificationFeedbackType) => {
      if (hapticsEnabled) {
        await Haptics.notificationAsync(type);
      }
    },
    [hapticsEnabled],
  );

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
