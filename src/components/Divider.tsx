import { AppView } from '@/components/ui';

import { ViewProps } from 'react-native-ui-lib';

type DividerProps = Pick<ViewProps, 'margin'>;

export const Divider = (props: DividerProps) => {
  return <AppView margin-16 {...props} />;
};
