import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
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
  snapPoints = ['60%', '90%'],
  ...props
}: AppModalProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const validatedSnapPoints = snapPoints.map((point) => {
    if (typeof point === 'string' && point.includes('%')) {
      const percentage = parseInt(point);
      return percentage > 90 ? '90%' : point;
    } else if (typeof point === 'number' && point > 0.9) {
      return 0.9;
    }
    return point;
  });

  const initialIndex = validatedSnapPoints.length - 1;

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

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

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? initialIndex : -1}
      snapPoints={validatedSnapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={dismissible ? enablePanDownToClose : false}
      backdropComponent={renderBackdrop}
      backgroundStyle={[{ backgroundColor: Colors.cardBG }, backgroundStyle]}
      handleIndicatorStyle={[
        styles.indicatorStyle,
        { backgroundColor: Colors.textColor },
      ]}
      {...props}>
      <BottomSheetScrollView
        style={StyleSheet.flatten([
          styles.contentContainer,
          { backgroundColor: Colors.cardBG },
          contentContainerStyle,
        ])}>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
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
