import { AppScreen } from '@/components/AppScreen';
import { AppView } from '@/components/ui';
import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewProps } from 'react-native-ui-lib';

interface AppKeyboardControllerProps extends PropsWithChildren, ViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: KeyboardAwareScrollViewProps;
}

export const AppKeyboardController = ({
  children,
  containerStyle,
  scrollViewProps,
  ...viewProps
}: AppKeyboardControllerProps) => {
  const { top } = useSafeAreaInsets();

  return (
    <>
      <AppScreen {...viewProps}>
        <KeyboardGestureArea style={styles.gestureWrapper} interpolator="ios">
          <KeyboardAwareScrollView
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bottomOffset={100}
            contentContainerStyle={[
              styles.contentScrollview,
              { paddingTop: top },
              containerStyle,
            ]}
            {...scrollViewProps}>
            <AppView flex>{children}</AppView>
          </KeyboardAwareScrollView>
        </KeyboardGestureArea>
      </AppScreen>
      <KeyboardToolbar />
    </>
  );
};

const styles = StyleSheet.create({
  gestureWrapper: {
    flexGrow: 1,
  },
  contentScrollview: {
    flexGrow: 1,
  },
});
