import { AppText, AppView } from '@/components/ui';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';
import { Colors } from 'react-native-ui-lib';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION = 3000;

interface SetupCompletionProgressProps {
  onComplete: () => void;
}

export const SetupCompletionProgress = ({
  onComplete,
}: SetupCompletionProgressProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: DURATION, easing: Easing.inOut(Easing.ease) },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [percentage, setPercentage] = useState(0);

  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (current, prev) => {
      if (current !== prev) {
        runOnJS(setPercentage)(current);
      }
    },
  );

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <AppView center paddingV-12>
      <AppView style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(128,128,128,0.2)"
            strokeWidth={STROKE_WIDTH}
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={percentage >= 99 ? Colors.success : Colors.primary}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
            animatedProps={animatedCircleProps}
          />
        </Svg>
        <AppView center style={StyleSheet.absoluteFill}>
          <AppText xsm semibold textColor>
            {percentage}%
          </AppText>
        </AppView>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    padding: 0,
  },
});
