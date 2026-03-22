import { LegendListRef } from '@legendapp/list';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { Dimensions, InteractionManager, ScrollView } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;

/**
 * Hook for ScrollView-based lists: scrolls so the "current" item
 * is centered in the viewport.  Returns a ref for the ScrollView
 * and an `onLayout` handler to attach to the current item's wrapper.
 */
export const useScrollToCurrentItem = (isActive: boolean) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const onCurrentItemLayout = useCallback(
    (y: number, height: number) => {
      if (!isActive) return;
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - WINDOW_HEIGHT / 2 + height / 2),
        animated: true,
      });
    },
    [isActive],
  );

  return { scrollViewRef, onCurrentItemLayout } as const;
};

/**
 * Hook for LegendList (FlatList-style): auto-scrolls to the item
 * at `currentIndex` after interactions settle.
 */
export const useScrollToCurrentIndex = (currentIndex: number) => {
  const listRef = useRef<LegendListRef>(null);

  useLayoutEffect(() => {
    if (currentIndex < 0) return;

    const interaction = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: currentIndex,
          viewPosition: 0.5,
          animated: true,
        });
      }, 250);
      return () => clearTimeout(timer);
    });

    return () => interaction.cancel();
  }, [currentIndex]);

  return { listRef } as const;
};
