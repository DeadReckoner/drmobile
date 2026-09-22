import { Env } from '@/constants/Env';
import { useHaptics } from '@/hooks/useHaptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

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
