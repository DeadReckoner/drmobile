import { AppButton } from '@/components/AppButton';
import { AppImage, AppText, AppView } from '@/components/ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  ImageSourcePropType,
  Modal,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

export interface HighlightFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HighlightStep {
  title: string;
  message: string;
  image?: ImageSourcePropType;
}

interface RoadmapHighlightOverlayProps {
  visible: boolean;
  currentStep: number;
  totalSteps: number;
  steps: HighlightStep[];
  contentOverrides?: Record<number, React.ReactNode>;
  highlightFrame?: HighlightFrame | null;
  nextLabel: string;
  doneLabel: string;
  onNext: () => void;
}

const PAD = 8;
const OVERLAY_BG = 'rgba(0,0,0,0.72)';
const CARD_MARGIN = 16;
const CARD_BOTTOM_MARGIN = 200;

const SMOOTH = { duration: 450, easing: Easing.out(Easing.cubic) };
const FADE_IN = { duration: 600, easing: Easing.out(Easing.quad) };
const FADE_OUT = { duration: 0, easing: Easing.in(Easing.quad) };

export const RoadmapHighlightOverlay = ({
  visible,
  currentStep,
  totalSteps,
  steps,
  contentOverrides,
  highlightFrame,
  nextLabel,
  doneLabel,
  onNext,
}: RoadmapHighlightOverlayProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const spotX = useSharedValue(0);
  const spotY = useSharedValue(0);
  const spotW = useSharedValue(0);
  const spotH = useSharedValue(0);

  const cardOpacity = useSharedValue(0);
  const prevStepRef = useRef(currentStep);
  const isFirstFrame = useRef(true);
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    // null = confirmed no target (e.g. intro step) – skip spotlight, just fade card in
    if (highlightFrame === null) {
      cardOpacity.value = withDelay(150, withTiming(1, FADE_IN));
      return;
    }
    // undefined = still measuring, wait
    if (highlightFrame === undefined) return;

    const x = Math.max(0, highlightFrame.x - PAD);
    const y = Math.max(0, highlightFrame.y - PAD);
    const w = Math.min(screenWidth - x, highlightFrame.width + PAD * 2);
    const h = highlightFrame.height + PAD * 2;

    if (isFirstFrame.current) {
      isFirstFrame.current = false;
    }
    spotX.value = withTiming(x, SMOOTH);
    spotY.value = withTiming(y, SMOOTH);
    spotW.value = withTiming(w, SMOOTH);
    spotH.value = withTiming(h, SMOOTH);

    cardOpacity.value = withDelay(250, withTiming(1, FADE_IN));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightFrame, screenWidth]);

  useEffect(() => {
    if (prevStepRef.current === currentStep) return;
    prevStepRef.current = currentStep;
    cardOpacity.value = withTiming(0, FADE_OUT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        isFirstFrame.current = true;
        cardOpacity.value = 0;
      }, 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const topSeg = useAnimatedStyle(() => ({ height: spotY.value + PAD * 2 }));
  const bottomSeg = useAnimatedStyle(() => ({
    top: spotY.value + spotH.value,
  }));
  const leftSeg = useAnimatedStyle(() => ({
    top: spotY.value,
    width: spotX.value,
    height: spotH.value,
  }));
  const rightSeg = useAnimatedStyle(() => ({
    top: spotY.value,
    left: spotX.value + spotW.value,
    height: spotH.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    left: spotX.value,
    top: spotY.value + PAD,
    width: spotW.value,
    height: spotH.value - PAD,
  }));

  const cardTop =
    highlightFrame === null
      ? cardHeight > 0
        ? (screenHeight - cardHeight) / 2
        : screenHeight
      : highlightFrame
        ? Math.min(
            highlightFrame.y + highlightFrame.height + PAD + CARD_MARGIN,
            screenHeight - CARD_BOTTOM_MARGIN,
          )
        : screenHeight * 0.55;

  const step = steps[currentStep];
  const customContent = contentOverrides?.[currentStep];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.seg, styles.segTop, topSeg]} />
        <Animated.View style={[styles.seg, styles.segBottom, bottomSeg]} />
        <Animated.View style={[styles.seg, leftSeg]} />
        <Animated.View style={[styles.seg, styles.segRight, rightSeg]} />
        <Animated.View
          style={[styles.spotBorder, { borderColor: Colors.blue }, borderStyle]}
        />
      </View>

      <Animated.View
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
        style={[
          styles.card,
          { top: cardTop, backgroundColor: Colors.lightCardBG },
          cardStyle,
        ]}>
        <AppText subtitle2 textColor style={styles.title}>
          {step?.title}
        </AppText>
        {customContent ?? (
          <>
            <AppText body2 light textColor>
              {step?.message}
            </AppText>
            {step?.image && (
              <AppImage
                source={step.image}
                style={styles.stepImage}
                resizeMode="contain"
              />
            )}
          </>
        )}

        <AppView row spread centerV marginT-12>
          <AppView row centerV gap-6>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentStep ? Colors.blue : Colors.textColor,
                    width: i === currentStep ? 16 : 6,
                  },
                ]}
              />
            ))}
          </AppView>
          <AppButton bg-blue paddingH-16 paddingV-6 br60 onPress={onNext}>
            <AppText xsm semibold textColor>
              {currentStep < totalSteps - 1 ? nextLabel : doneLabel}
            </AppText>
          </AppButton>
        </AppView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  seg: {
    position: 'absolute',
    backgroundColor: OVERLAY_BG,
  },
  segTop: {
    top: 0,
    left: 0,
    right: 0,
  },
  segBottom: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  segRight: {
    right: 0,
  },
  card: {
    position: 'absolute',
    left: CARD_MARGIN,
    right: CARD_MARGIN,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    marginBottom: 8,
  },
  stepImage: {
    width: '100%',
    height: 300,
    marginTop: 12,
    borderRadius: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  spotBorder: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
  },
});
