import { FontTextStyleType } from '@/hooks/types/fontConfig.types';
import { Platform } from 'react-native';

const UNBOUNDED_BOLD = Platform.select({
  ios: 'Unbounded-Bold',
  android: 'Unbounded_700Bold',
});
const UNBOUNDED_SEMIBOLD = Platform.select({
  ios: 'Unbounded-SemiBold',
  android: 'Unbounded_600SemiBold',
});
const UNBOUNDED_REGULAR = Platform.select({
  ios: 'Unbounded-Regular',
  android: 'Unbounded_400Regular',
});
const UNBOUNDED_LIGHT = Platform.select({
  ios: 'Unbounded-Light',
  android: 'Unbounded_300Light',
});

const UNBOUNDED_EXTRA_LIGHT = Platform.select({
  ios: 'Unbounded-ExtraLight',
  android: 'Unbounded_200ExtraLight',
});

export const FONT_CONFIG_MAP: Record<string, FontTextStyleType> = {
  hero: {
    fontFamily: UNBOUNDED_BOLD,
    fontSize: 32,
  },

  h2: {
    fontFamily: UNBOUNDED_SEMIBOLD,
    fontSize: 24,
  },

  caption: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  captionLight: {
    fontFamily: UNBOUNDED_LIGHT,
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 1,
  },

  subtitle1: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 18,
  },

  subtitle2: {
    fontFamily: UNBOUNDED_SEMIBOLD,
    fontSize: 16,
  },

  body1: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 16,
  },

  body2: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 14,
    lineHeight: 22,
  },

  sm: {
    fontFamily: UNBOUNDED_LIGHT,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  xsm: {
    fontFamily: UNBOUNDED_EXTRA_LIGHT,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.5,
  },

  buttonLable: {
    fontFamily: UNBOUNDED_BOLD,
    fontSize: 16,
  },

  floatingButtonLable: {
    fontFamily: UNBOUNDED_SEMIBOLD,
    fontSize: 14,
    letterSpacing: 1.2,
  },

  tabLabel: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 10,
  },

  bold: {
    fontFamily: UNBOUNDED_BOLD,
  },
  semibold: {
    fontFamily: UNBOUNDED_SEMIBOLD,
  },
  regular: {
    fontFamily: UNBOUNDED_REGULAR,
  },
  light: {
    fontFamily: UNBOUNDED_LIGHT,
  },
  extraLight: {
    fontFamily: UNBOUNDED_EXTRA_LIGHT,
  },
};
