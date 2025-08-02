import { AppView } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewProps } from 'react-native-ui-lib';

const PADDING = 16;

export const AppScreen = ({ children, ...restProps }: ViewProps) => {
  const insets = useSafeAreaInsets();
  const paddingTopValue = insets.top + PADDING || PADDING;

  const hasVerticalPadding = Object.keys(restProps).some(
    (key) => key.startsWith('paddingT-') || key.startsWith('paddingV-'),
  );

  let viewProps = { ...restProps };

  if (!hasVerticalPadding) {
    viewProps = {
      [`paddingT-${paddingTopValue}`]: true,
      ...restProps,
    };
  }

  return (
    <AppView flex bg-screenBG paddingH-16 {...viewProps}>
      {children}
    </AppView>
  );
};
