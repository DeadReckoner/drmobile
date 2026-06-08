import { useHaptics } from '@/hooks/useHaptics';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  hideToastAction,
  selectToastSettings,
  showToastAction,
} from '@/store/slices/toastSlice';
import { ToastStateType } from '@/store/types/toastSlice.types';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const HIDE_SHOW_DELAY = 150;

export const useToast = () => {
  const dispatch = useDispatch();
  const { isVisible, toastProps } = useAppSelector(selectToastSettings);
  const { notificationAsync } = useHaptics();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (toastProps?: ToastStateType['toastProps']) => {
      try {
        if (!toastProps?.message) {
          return;
        }
        if (!isVisible) {
          dispatch(showToastAction({ toastProps }));
          if (toastProps.type === 'success') {
            notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (toastProps.type === 'failure') {
            notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } else {
          dispatch(hideToastAction());
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            dispatch(showToastAction({ toastProps }));
          }, HIDE_SHOW_DELAY);
        }
      } catch {}
    },
    [dispatch, isVisible, notificationAsync],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hideToast = () => {
    dispatch(hideToastAction());
  };

  return {
    isVisible,
    toastProps,
    hideToast,
    showToast,
  };
};
