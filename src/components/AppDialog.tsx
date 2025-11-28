import { AppRNUIDialog } from '@/components/ui';
import { StyleSheet } from 'react-native';
import { Colors, DialogProps } from 'react-native-ui-lib';

export const AppDialog = ({
  children,
  containerStyle,
  ...restProps
}: DialogProps) => {
  return (
    <AppRNUIDialog
      useSafeArea
      center
      containerStyle={[styles.dialogContainer, containerStyle]}
      modalProps={{ overlayBackgroundColor: Colors.dialogOverlay }}
      {...restProps}>
      {children}
    </AppRNUIDialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: 'transparent',
    width: '85%',
  },
});
