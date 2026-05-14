import { AppButton } from '@/components/AppButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Animations } from '@/utils/animation.utils';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, ViewProps } from 'react-native-ui-lib';

interface AppFloatingButtonProps {
  visible?: boolean;
  isLoading?: boolean;
  translationKey: TranslationKeysType;
  onPress: () => void;
  containerProps?: ViewProps;
  backgroundColor?: string;
  shadowColor?: string;
}

const ANIMATION_DURATION = 300;

export const AppFloatingButton = ({
  visible,
  translationKey,
  onPress,
  isLoading = false,
  backgroundColor = Colors.primary,
  shadowColor,
  containerProps,
}: AppFloatingButtonProps) => {
  const [buttonDimensions, setButtonDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showText, setShowText] = useState(true);
  const animatedWidth = useSharedValue(0);
  const animatedBorderRadius = useSharedValue(100);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (!buttonDimensions.width && !buttonDimensions.height) {
      setButtonDimensions({ width, height });
      animatedWidth.value = width;
    }
  };

  useEffect(() => {
    if (buttonDimensions.width && buttonDimensions.height) {
      if (isLoading) {
        setShowText(false);
        animatedWidth.value = withTiming(buttonDimensions.height, {
          duration: ANIMATION_DURATION,
        });
        animatedBorderRadius.value = withTiming(200, {
          duration: ANIMATION_DURATION,
        });
      } else {
        setShowText(false);
        animatedWidth.value = withTiming(buttonDimensions.width, {
          duration: ANIMATION_DURATION,
        });
        animatedBorderRadius.value = withTiming(100, {
          duration: ANIMATION_DURATION,
        });
        setTimeout(() => {
          setShowText(true);
        }, ANIMATION_DURATION);
      }
    }
  }, [isLoading, buttonDimensions, animatedWidth, animatedBorderRadius]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value > 0 ? animatedWidth.value : undefined,
      borderRadius: animatedBorderRadius.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.floatingButtonContainer,
        { display: visible ? 'flex' : 'none' },
      ]}
      entering={Animations.Entry.FadeInDownWithSpring()
        .delay(800)
        .duration(2000)}
      exiting={Animations.Exit.FadeOutDown()}>
      <Animated.View onLayout={handleLayout} style={animatedButtonStyle}>
        <AppButton
          onPress={onPress}
          style={[
            styles.floatingButton,
            {
              backgroundColor: backgroundColor,
              shadowColor: shadowColor || backgroundColor,
              borderColor: Colors.outline,
            },
            containerProps?.style,
          ]}>
          {!isLoading && (
            <AppView height={18}>
              {showText && (
                <TranslatedText body2 translationKey={translationKey} />
              )}
            </AppView>
          )}
          {isLoading && <ActivityIndicator color={Colors.textOnPrimary} />}
        </AppButton>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    zIndex: 10,
  },
  floatingButton: {
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    borderWidth: 0.5,
    padding: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
});
