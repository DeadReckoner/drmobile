import { AppView } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewProps } from 'react-native-ui-lib';

interface AppScreenProps extends ViewProps {
  safeArea?: boolean;
}

export const AppScreen = ({
  children,
  safeArea,
  ...restProps
}: AppScreenProps) => {
  const insets = useSafeAreaInsets();
  const paddingTopValue = insets.top;

  const viewProps = { [`paddingT-${paddingTopValue}`]: safeArea, ...restProps };

  return (
    <AppView flex bg-screenBG paddingH-16 {...viewProps}>
      {children}
    </AppView>
  );
};
