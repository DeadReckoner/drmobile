import { DarkColorCodes, LightColorCodes } from '@/constants/ColorCodes';
import { FontTextStyleType } from '@/hooks/types/fontConfig.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectTheme,
  setThemeAction,
  toggleThemeAction,
} from '@/store/slices/settingsSlice';
import { Platform } from 'react-native';
import {
  Assets,
  Colors,
  TextFieldProps,
  ThemeManager,
  Typography,
} from 'react-native-ui-lib';

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

const FONT_CONFIG_MAP: Record<string, FontTextStyleType> = {
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
  },

  captionLight: {
    fontFamily: UNBOUNDED_LIGHT,
    fontSize: 12,
    lineHeight: 18,
  },

  body2: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 14,
  },

  sm: {
    fontFamily: UNBOUNDED_LIGHT,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  buttonLable: {
    fontFamily: UNBOUNDED_BOLD,
    fontSize: 16,
  },
};

export const useAppTheme = () => {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  const loadTypography = () => {
    Typography.loadTypographies(FONT_CONFIG_MAP);
  };

  const loadColorSchemes = () => {
    Colors.loadSchemes({
      light: LightColorCodes,
      dark: DarkColorCodes,
    });
  };

  const loadAssets = () => {
    Assets.loadAssetsGroup('logo', {
      google: require('assets/images/google-logo.webp'),
    });
  };

  const loadTextFieldTheme = () => {
    ThemeManager.setComponentTheme('TextField', (props: TextFieldProps) => {
      return {
        color: Colors.textColor,
        labelStyle: Typography.body2,
        labelColor: Colors.textColor,
        placeholderTextColor: Colors.secondary,
        ...props,
      };
    });
  };

  const initializeTheme = () => {
    loadTypography();
    loadColorSchemes();
    loadTextFieldTheme();
    loadAssets();
    Colors.setScheme(theme);
    dispatch(setThemeAction(theme));
  };

  const toggleTheme = () => {
    Colors.setScheme(theme === 'light' ? 'dark' : 'light');
    dispatch(toggleThemeAction());
  };

  return { initializeTheme, toggleTheme, theme };
};
