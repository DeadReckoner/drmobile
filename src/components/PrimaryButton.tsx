import { TranslatedText } from '@/components/TranslatedText';
import { AppTouchableOpacity } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import { Colors, TouchableOpacityProps } from 'react-native-ui-lib';

interface PrimaryButtonProps {
  label: TranslationKeysType;
  onPress: TouchableOpacityProps['onPress'];
  isLoading?: boolean;
}

const DURATION = 200;
const ANIMATION_DURATION: WithTimingConfig = {
  duration: DURATION,
  easing: Easing.ease,
};

const PrimaryButton = ({ label, onPress, isLoading }: PrimaryButtonProps) => {
  const textAnimationStyle = useSharedValue(1);
  const loaderAnimationStyle = useSharedValue(0);

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderAnimationStyle.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textAnimationStyle.value,
  }));

  const timingAnimation = (timingValue: number) =>
    withTiming(timingValue, ANIMATION_DURATION);

  const delayAnimation = (timingValue: number) =>
    withDelay(DURATION, timingAnimation(timingValue));

  const showLoader = () => {
    if (!isLoading) {
      textAnimationStyle.value = delayAnimation(1);
      loaderAnimationStyle.value = timingAnimation(0);
      return;
    }
    textAnimationStyle.value = timingAnimation(0);
    loaderAnimationStyle.value = delayAnimation(1);
  };

  return (
    <AppTouchableOpacity
      center
      padding-16
      bg-primary
      br30
      onPress={() => {
        onPress?.();
        showLoader();
      }}
      //   disabled={isLoading}
    >
      <Animated.View style={textStyle}>
        <TranslatedText buttonLable translationKey={label} />
      </Animated.View>

      <Animated.View
        style={[
          styles.loaderContainer,
          loaderStyle,
          StyleSheet.absoluteFillObject,
        ]}>
        <ActivityIndicator color={Colors.textOnPrimary} />
      </Animated.View>
    </AppTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PrimaryButton;
