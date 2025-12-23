import { Env } from '@/constants/Env';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export const HapticTab = (props: BottomTabBarButtonProps) => {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
};
