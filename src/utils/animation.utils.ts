import {
  FadeIn,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';

const DURATION = 250;
const DELAY = 150;

export const Animations = {
  Layout: {
    Springify: LinearTransition.springify().damping(15).stiffness(150),
  },
  Entry: {
    FadeIn: FadeIn.duration(DURATION).delay(DELAY),
    FadeInDown: FadeInDown.duration(DURATION).delay(DELAY),
    FadeInDownWithSpring: FadeInDown.duration(DURATION).springify(),
  },
  Exit: {
    FadeOutDown: FadeOutDown.duration(DURATION),
  },
};
