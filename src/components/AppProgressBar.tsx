import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  BorderRadiuses,
  Colors,
  Constants,
  Spacings,
} from 'react-native-ui-lib';

interface AppProgressBarProps {
  progress?: number;
  progressColor?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  progressStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AppProgressBar = ({
  progress = 0,
  progressColor,
  fullWidth = false,
  style,
  progressStyle,
  containerStyle,
  testID,
}: AppProgressBarProps) => {
  const [containerWidth, setContainerWidth] = React.useState<
    number | undefined
  >(undefined);
  const progressAnimation = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      duration: 220,
      easing: Easing.ease,
      toValue: progress,
      useNativeDriver: true,
    }).start();
  }, [progress, progressAnimation]);

  const containerHeight = (() => {
    if (Constants.isTablet) {
      return fullWidth ? 10 : 6;
    }
    return fullWidth ? Spacings.s1 : Spacings.s2;
  })();

  const containerBaseStyle: ViewStyle = fullWidth
    ? { height: containerHeight }
    : { height: containerHeight, borderRadius: BorderRadiuses.br100 };

  const outputRange = Constants.isRTL
    ? [containerWidth ?? 0, 0]
    : [0, containerWidth ?? 0];

  const translateX = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange,
  });

  const progressBorderRadius: ViewStyle = fullWidth
    ? {
        borderBottomRightRadius: BorderRadiuses.br100,
        borderTopRightRadius: BorderRadiuses.br100,
      }
    : { borderRadius: BorderRadiuses.br100 };

  const progressColorResolved = progressColor ?? Colors.$backgroundPrimaryHeavy;

  return (
    <View
      onLayout={(event) => {
        if (!containerWidth) {
          setContainerWidth(event.nativeEvent.layout.width);
        }
      }}
      style={[styles.container, containerBaseStyle, style, containerStyle]}
      accessibilityRole="progressbar"
      testID={testID}>
      {!!containerWidth && (
        <Animated.View
          style={[
            styles.progress,
            progressBorderRadius,
            {
              right: Constants.isRTL ? undefined : containerWidth,
              backgroundColor: progressColorResolved,
            },
            progressStyle,
            { transform: [{ translateX }] },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.$backgroundNeutralMedium,
    overflow: 'hidden',
    borderRadius: BorderRadiuses.br100,
  },
  progress: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});
