import {
  FadeIn,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';

const DURATION = 250;
const DEFAULT_DELAY = 150;

export const Animations = {
  Layout: {
    Springify: () => LinearTransition.springify().damping(15).stiffness(150),
  },
  Entry: {
    FadeIn: (delayMs: number = DEFAULT_DELAY) =>
      FadeIn.duration(DURATION).delay(delayMs),

    FadeInDown: (delayMs: number = DEFAULT_DELAY) =>
      FadeInDown.duration(DURATION).delay(delayMs),

    FadeInDownWithSpring: (delayMs: number = 0) =>
      FadeInDown.duration(DURATION).springify().delay(delayMs),
  },
  Exit: {
    FadeOutDown: () => FadeOutDown.duration(DURATION),
  },
};
