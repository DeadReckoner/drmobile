import { LegendListRef } from '@legendapp/list';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;

type IdleCleanupType = () => void;
type IdleRequestCallbackType = () => void;
type IdleApiType = typeof globalThis & {
  requestIdleCallback?: (_callback: IdleRequestCallbackType) => number;
  cancelIdleCallback?: (_id: number) => void;
};
const idleApi = globalThis as IdleApiType;

const runWhenIdle = (callback: () => void): IdleCleanupType => {
  if (typeof idleApi.requestIdleCallback === 'function') {
    const idleId = idleApi.requestIdleCallback(() => {
      callback();
    });

    return () => {
      if (typeof idleApi.cancelIdleCallback === 'function') {
        idleApi.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = setTimeout(callback, 16);
  return () => clearTimeout(timeoutId);
};

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
 * Pass `totalCount` so the last item uses scrollToEnd, ensuring it is
 * fully visible instead of only partially shown.
 */
export const useScrollToCurrentIndex = (
  currentIndex: number,
  totalCount?: number,
) => {
  const listRef = useRef<LegendListRef>(null);

  useLayoutEffect(() => {
    if (currentIndex < 0) return;

    const isLastItem =
      totalCount !== undefined && currentIndex === totalCount - 1;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancelIdle = runWhenIdle(() => {
      timer = setTimeout(() => {
        if (isLastItem) {
          listRef.current?.scrollToEnd({ animated: true });
        } else {
          listRef.current?.scrollToIndex({
            index: currentIndex,
            viewPosition: 0.5,
            animated: true,
          });
        }
      }, 250);
    });

    return () => {
      cancelIdle();
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, totalCount]);

  return { listRef } as const;
};
