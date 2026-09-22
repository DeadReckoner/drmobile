import { DarkColorCodes, LightColorCodes } from '@/constants/ColorCodes';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectTheme,
  setThemeAction,
  toggleThemeAction,
} from '@/store/slices/settingsSlice';
import { FONT_CONFIG_MAP } from '@/utils/typography.utils';
import { Assets, Colors, ThemeManager, Typography } from 'react-native-ui-lib';

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
      aiRoadmapBG: require('assets/images/ai-roadmap-bg.png'),
    });
  };

  const loadComponentThemes = () => {
    ThemeManager.setComponentTheme('TextField', {
      color: Colors.textColor,
      labelStyle: Typography.body2,
      labelColor: Colors.textColor,
      placeholderTextColor: Colors.secondary,
    });
  };

  const initializeTheme = () => {
    dispatch(setThemeAction(theme));
    Colors.setScheme(theme);
    loadColorSchemes();
    loadAssets();
    loadComponentThemes();
    loadTypography();
  };

  const toggleTheme = () => {
    Colors.setScheme(theme === 'light' ? 'dark' : 'light');
    dispatch(toggleThemeAction());
  };

  return { initializeTheme, toggleTheme, theme };
};
