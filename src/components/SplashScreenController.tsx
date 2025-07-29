import { ChildWrapperProps } from '@/components/types/component.types';
import { AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { SplashScreen } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export const SplashScreenController = ({ children }: ChildWrapperProps) => {
  const { initializeTheme } = useAppTheme();
  const { initializeLocalization } = useLocalization();
  const [isReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeTheme();
    initializeLocalization();
    setIsAppReady(true);
  }, [initializeLocalization, initializeTheme]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <AppView flex-1 onLayout={onLayoutRootView}>
      {children}
    </AppView>
  );
};
