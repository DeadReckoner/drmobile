import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  hideToast,
  selectToastSettings,
  showToast,
} from '@/store/slices/settingsSlice';
import { ToastStateType } from '@/store/types/settingsSlice.types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const useToast = () => {
  const dispatch = useDispatch();
  const { isVisible, toastProps } = useAppSelector(selectToastSettings);
  const HIDE_SHOW_DELAY = 150;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAppToast = (toastProps?: ToastStateType['toastProps']) => {
    if (!isVisible) {
      dispatch(showToast({ toastProps }));
    } else {
      dispatch(hideToast());
      timeoutRef.current = setTimeout(() => {
        dispatch(showToast({ toastProps }));
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

  const hideAppToast = () => {
    dispatch(hideToast());
  };

  return {
    isVisible,
    toastProps,
    hideToast: hideAppToast,
    showToast: showAppToast,
  };
};

export default useToast;
