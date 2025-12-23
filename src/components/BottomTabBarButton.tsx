import { Pressable, PressableProps } from 'react-native';

export const BottomTabBarButton = (props: PressableProps) => {
  return (
    <Pressable {...props} android_ripple={null}>
      {props.children}
    </Pressable>
  );
};
