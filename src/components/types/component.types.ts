import { ReactElement } from 'react';
import { ViewProps } from 'react-native-ui-lib';

export interface ChildWrapperProps extends ViewProps {
  children: ReactElement | ReactElement[];
}
