import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

export const Loader = () => {
  const opacity = useSharedValue(0);
  const viewStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.ease,
    });
    return () => {
      opacity.value = withTiming(0, {
        duration: 300,
      });
    };
  }, [opacity]);
  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.loader, viewStyles]}>
      <ActivityIndicator color={Colors.white} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loader: {
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    opacity: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
