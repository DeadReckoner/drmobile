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

  body2: {
    fontFamily: UNBOUNDED_REGULAR,
    fontSize: 14,
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

  const loadTextFieldTheme = () => {
    ThemeManager.setComponentTheme('TextField', (props: TextFieldProps) => {
      return {
        color: Colors.textColor,
        labelStyle: Typography.body2,
        labelColor: Colors.textColor,
        placeholderTextColor: Colors.outline,
        ...props,
      };
    });
  };

  const initializeTheme = () => {
    loadTypography();
    loadColorSchemes();
    loadTextFieldTheme();
    Colors.setScheme(theme);
    dispatch(setThemeAction(theme));
  };

  const toggleTheme = () => {
    Colors.setScheme(theme === 'light' ? 'dark' : 'light');
    dispatch(toggleThemeAction());
  };

  return { initializeTheme, toggleTheme, theme };
};
