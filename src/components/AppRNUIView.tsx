import React from 'react';
import { Animated, type StyleProp, View, type ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import RNUIView from 'react-native-ui-lib/view';

type RNUIViewProps = React.ComponentProps<typeof RNUIView>;

export interface AppRNUIViewProps extends Omit<RNUIViewProps, 'style'> {
  style?: StyleProp<
    ViewStyle | Animated.AnimatedProps<ViewStyle> | AnimatedStyle<ViewStyle>
  >;
}

const AppRNUIView = React.forwardRef<View, AppRNUIViewProps>(
  ({ style, ...rest }, ref) => (
    <RNUIView
      ref={ref}
      style={style as StyleProp<ViewStyle | Animated.AnimatedProps<ViewStyle>>}
      {...rest}
    />
  ),
);

AppRNUIView.displayName = 'AppRNUIView';

export default AppRNUIView;
