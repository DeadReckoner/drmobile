import { FadeIn, FadeInDown, FadeOutDown } from 'react-native-reanimated';

const DURATION = 250;
const DELAY = 150;

export const Animations = {
  Entry: {
    FadeIn: FadeIn.duration(DURATION).delay(DELAY),
    FadeInDown: FadeInDown.duration(DURATION).delay(DELAY),
    FadeInDownWithSpring: FadeInDown.duration(DURATION).springify(),
  },
  Exit: {
    FadeOutDown: FadeOutDown.duration(DURATION),
  },
};
