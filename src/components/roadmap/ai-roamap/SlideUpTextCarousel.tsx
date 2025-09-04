import { AppText, AppView } from '@/components/ui';
import { Animations } from '@/utils/animation.utils';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface SlideUpTextCarouselProps {
  items: string[];
  currentIndex?: number;
}
const TRANSLATE_VALUE = 20;
const TIMING_ANIMATION_CONFIG = { duration: 300 };

export const SlideUpTextCarousel: React.FC<SlideUpTextCarouselProps> = ({
  items,
}) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      opacity.value = withTiming(0, TIMING_ANIMATION_CONFIG);
      translateY.value = withTiming(-TRANSLATE_VALUE, TIMING_ANIMATION_CONFIG);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        translateY.value = TRANSLATE_VALUE;
        opacity.value = withTiming(1, TIMING_ANIMATION_CONFIG);
        translateY.value = withTiming(0, TIMING_ANIMATION_CONFIG);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!items.length) return null;

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDownWithSpring(300)}
      style={styles.container}>
      <AppView reanimated style={animatedStyle}>
        <AppText body2 textColor style={{ fontSize: 13 }}>
          {items[currentIndex]}
        </AppText>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    flexGrow: 0,
    zIndex: 500,
    paddingHorizontal: 16,
  },
});
