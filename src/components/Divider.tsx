import { AppView } from '@/components/ui';

import { ViewProps } from 'react-native-ui-lib';

type DividerProps = Pick<ViewProps, 'margin'>;

const Divider = (props: DividerProps) => {
  return <AppView margin-16 {...props} />;
};

export default Divider;
