import { HighlightFrame } from '@/components/roadmap/RoadmapHighlightOverlay';
import { useRoadmapFeatureHighlight } from '@/hooks/useRoadmapFeatureHighlight';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

export const useRoadmapHighlightController = (
  isCustomRoadmap?: boolean,
  isLoading?: boolean,
) => {
  const highlight = useRoadmapFeatureHighlight(isCustomRoadmap, isLoading);
  const { isVisible, currentStep, getTarget, setTargetRef } = highlight;

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  // undefined = still measuring | null = confirmed no target | HighlightFrame = has target
  const [highlightFrame, setHighlightFrame] = useState<
    HighlightFrame | null | undefined
  >();
  const pendingMeasure = useRef(false);
  const scrollFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleTargetLayout = useCallback(
    (index: number, ref: View | null) => {
      setTargetRef(index, ref);
    },
    [setTargetRef],
  );

  const measureAndSetFrame = useCallback(() => {
    const target = getTarget();
    if (target) {
      (target as View).measureInWindow((x, y, width, height) => {
        setHighlightFrame({ x, y, width, height });
      });
    } else {
      // No target for this step – signal overlay to show card without spotlight
      setHighlightFrame(null);
    }
  }, [getTarget]);

  const onScrollEnd = useCallback(() => {
    if (pendingMeasure.current) {
      pendingMeasure.current = false;
      if (scrollFallbackTimer.current) {
        clearTimeout(scrollFallbackTimer.current);
        scrollFallbackTimer.current = null;
      }
      setTimeout(() => measureAndSetFrame(), 50);
    }
  }, [measureAndSetFrame]);

  const scrollToAndMeasure = useCallback(() => {
    const target = getTarget();
    if (!target || !scrollContentRef.current) {
      measureAndSetFrame();
      return;
    }
    (target as View).measureLayout(
      scrollContentRef.current,
      (_x: number, y: number) => {
        pendingMeasure.current = true;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 80),
          animated: true,
        });
        scrollFallbackTimer.current = setTimeout(() => {
          if (pendingMeasure.current) {
            pendingMeasure.current = false;
            measureAndSetFrame();
          }
        }, 600);
      },
      () => measureAndSetFrame(),
    );
  }, [getTarget, measureAndSetFrame]);

  useEffect(() => {
    if (isVisible) {
      setHighlightFrame(undefined);
      scrollToAndMeasure();
    }
  }, [currentStep, isVisible, scrollToAndMeasure]);

  return {
    ...highlight,
    scrollViewRef,
    scrollContentRef,
    highlightFrame,
    handleTargetLayout,
    onScrollEnd,
  };
};
