import { AppView } from '@/components/ui';
import { Animations } from '@/utils/animation.utils';
import React from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
} from 'react-native';
import { Colors, ViewProps } from 'react-native-ui-lib';

interface LoaderProps extends ActivityIndicatorProps {
  transparent?: boolean;
  containerStyle?: ViewProps['style'];
  shouldAnimate?: boolean;
}
export const Loader = ({
  transparent = false,
  containerStyle,
  shouldAnimate = true,
  ...props
}: LoaderProps) => {
  return (
    <AppView
      reanimated={shouldAnimate}
      entering={Animations.Entry.FadeInDownWithSpring()}
      style={[
        StyleSheet.absoluteFill,
        styles.loader,
        !transparent && { backgroundColor: Colors.dialogOverlay },
        containerStyle,
      ]}>
      <ActivityIndicator color={Colors.textColor} {...props} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  loader: {
    zIndex: 1000,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
