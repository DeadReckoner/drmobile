import { AppView } from '@/components/ui';
import React from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
} from 'react-native';
import { Colors, ViewProps } from 'react-native-ui-lib';

interface LoaderProps extends ActivityIndicatorProps {
  transparent?: boolean;
  containerStyle?: ViewProps['style'];
}
export const Loader = ({
  transparent = false,
  containerStyle,
  ...props
}: LoaderProps) => {
  return (
    <AppView
      style={[
        StyleSheet.absoluteFillObject,
        styles.loader,
        !transparent && { backgroundColor: Colors.dialogOverlay },
        containerStyle,
      ]}>
      <ActivityIndicator color={Colors.inverse} {...props} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  loader: {
    zIndex: 1000,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
