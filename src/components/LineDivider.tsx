import { AppView } from '@/components/ui';

import { ViewProps } from 'react-native-ui-lib';

type LineDividerProps = Pick<ViewProps, 'marginV' | 'height' | 'width'>;

export const LineDivider = (props: LineDividerProps) => {
  return <AppView height={1} br30 bg-lineDivider marginV-16 {...props} />;
};
