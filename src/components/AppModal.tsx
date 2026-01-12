import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from 'react-native-ui-lib';

interface AppModalProps extends Omit<BottomSheetProps, 'visible'> {
  visible: boolean;
  setIsVisible: (_visible: boolean) => void;
  snapPoints?: string[] | number[];
  enablePanDownToClose?: boolean;
  dismissible?: boolean;
  backgroundStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const AppModal = ({
  visible,
  setIsVisible,
  children,
  enablePanDownToClose = true,
  dismissible = true,
  backgroundStyle,
  contentContainerStyle,
  ...props
}: AppModalProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && dismissible) {
        setIsVisible(false);
      }
    },
    [setIsVisible, dismissible],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={dismissible ? 'close' : 'none'}
      />
    ),
    [dismissible],
  );

  if (!visible) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={['60%', '90%']}
        onChange={handleSheetChanges}
        enablePanDownToClose={dismissible ? enablePanDownToClose : false}
        backdropComponent={renderBackdrop}
        backgroundStyle={[{ backgroundColor: Colors.cardBG }, backgroundStyle]}
        handleIndicatorStyle={[
          styles.indicatorStyle,
          { backgroundColor: Colors.textColor },
        ]}
        {...props}>
        <BottomSheetView
          style={[
            styles.contentContainer,
            { backgroundColor: Colors.cardBG },
            contentContainerStyle,
          ]}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  indicatorStyle: {
    width: 80,
  },
});
