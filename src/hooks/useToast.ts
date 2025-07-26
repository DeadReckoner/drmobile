import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  hideToastAction,
  selectToastSettings,
  showToastAction,
} from '@/store/slices/settingsSlice';
import { ToastStateType } from '@/store/types/settingsSlice.types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const HIDE_SHOW_DELAY = 150;

export const useToast = () => {
  const dispatch = useDispatch();
  const { isVisible, toastProps } = useAppSelector(selectToastSettings);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (toastProps?: ToastStateType['toastProps']) => {
    if (!toastProps?.message) {
      return;
    }
    if (!isVisible) {
      dispatch(showToastAction({ toastProps }));
    } else {
      dispatch(hideToastAction());
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        dispatch(showToastAction({ toastProps }));
      }, HIDE_SHOW_DELAY);
    }
  };

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
