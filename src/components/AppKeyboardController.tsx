import { AppScreen } from '@/components/AppScreen';
import { AppView } from '@/components/ui';
import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

interface AppKeyboardControllerProps extends PropsWithChildren {
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppKeyboardController = ({
  children,
  containerStyle,
}: AppKeyboardControllerProps) => {
  return (
    <>
      <AppScreen>
        <KeyboardGestureArea style={styles.gestureWrapper} interpolator="ios">
          <KeyboardAwareScrollView
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bottomOffset={100}
            contentContainerStyle={[styles.contentScrollview, containerStyle]}>
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
