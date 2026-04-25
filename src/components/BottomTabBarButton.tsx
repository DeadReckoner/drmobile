import { useHaptics } from '@/hooks/useHaptics';
import { Pressable, PressableProps } from 'react-native';

export const BottomTabBarButton = (props: PressableProps) => {
  const { impactAsync } = useHaptics();
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        impactAsync();
        props.onPress?.(e);
      }}
      android_ripple={null}>
      {props.children}
    </Pressable>
  );
};
