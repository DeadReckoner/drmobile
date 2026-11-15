import { Env } from '@/constants/Env';
import { useHaptics } from '@/hooks/useHaptics';
import type { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { PlatformPressable } from 'expo-router/react-navigation';

export const HapticTab = (props: BottomTabBarButtonProps) => {
  const { impactAsync } = useHaptics();
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Env.EXPO_OS === 'ios') {
          impactAsync();
        }
        props.onPressIn?.(ev);
      }}
    />
  );
};
