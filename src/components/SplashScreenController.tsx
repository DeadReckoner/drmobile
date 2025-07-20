import { ChildWrapperProps } from '@/components/types/component.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export const SplashScreenController = ({ children }: ChildWrapperProps) => {
  const { initializeTheme } = useAppTheme();
  const { initializeLocalization } = useLocalization();
  const [isReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeTheme();
    initializeLocalization();
    SplashScreen.hide();
    setIsAppReady(true);
  }, [initializeLocalization, initializeTheme]);

  if (!isReady) {
    return null;
  }

  return children;
};
