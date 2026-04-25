import { AppButton } from '@/components/AppButton';
import { AppText, AppView } from '@/components/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface AppSegmentControlProps {
  segments: string[];
  selectedIndex: number;
  onSegmentChange: (_index: number) => void;
}

export const AppSegmentControl = ({
  segments,
  selectedIndex,
  onSegmentChange,
}: AppSegmentControlProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth =
    containerWidth > 0 ? containerWidth / segments.length : 0;
  const translateX = useSharedValue(0);
  const isFirstLayout = useRef(true);

  useEffect(() => {
    if (segmentWidth > 0) {
      const newX = selectedIndex * segmentWidth;
      if (isFirstLayout.current) {
        translateX.value = newX;
        isFirstLayout.current = false;
      } else {
        translateX.value = withSpring(newX, { damping: 20, stiffness: 150 });
      }
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <AppView
      row
      br20
      onLayout={handleLayout}
      style={[styles.container, { borderColor: Colors.accent }]}>
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.slider,
            { width: segmentWidth, backgroundColor: Colors.accent },
            sliderStyle,
          ]}
        />
      )}
      {segments.map((segment, index) => (
        <AppButton
          key={segment}
          center
          flex
          padding-10
          style={styles.button}
          onPress={() => onSegmentChange(index)}>
          <AppText
            color={
              selectedIndex === index ? Colors.textOnPrimary : Colors.textColor
            }
            xsm
            regular>
            {segment}
          </AppText>
        </AppButton>
      ))}
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  button: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
