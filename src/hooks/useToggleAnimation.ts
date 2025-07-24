import { useCallback, useMemo } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithTimingConfig,
} from 'react-native-reanimated';

const ANIMATION_CONFIG: WithTimingConfig = {
  duration: 300,
  easing: Easing.ease,
};

interface UseToggleAnimationProps {
  initialValue?: 0 | 1;
  duration?: number;
  config?: WithTimingConfig;
}

export const useToggleAnimation = ({
  initialValue = 1,
  config = ANIMATION_CONFIG,
}: UseToggleAnimationProps) => {
  const shared = useSharedValue(initialValue);

  const timingConfig = useMemo<WithTimingConfig>(
    () => ({
      duration: config.duration || ANIMATION_CONFIG.duration,
      easing: config.easing || ANIMATION_CONFIG.easing,
    }),
    [config],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shared.value,
    transform: [
      {
        scale: shared.value,
      },
    ],
  }));

  const set = useCallback(
    (value: 0 | 1) => {
      shared.value = withSpring(value, timingConfig);
    },
    [shared, timingConfig],
  );

  return {
    animatedStyle,
    set,
  };
};
