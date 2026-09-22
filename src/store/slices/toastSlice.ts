import { createAppSelector } from '@/store/hooks/store.hooks';
import type { ToastStateType } from '@/store/types/toastSlice.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ToastStateType = {
  isVisible: false,
  toastProps: { type: 'general' },
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToastAction(
      state,
      action: PayloadAction<Pick<ToastStateType, 'toastProps'>>,
    ) {
      state.isVisible = true;
      state.toastProps = action.payload.toastProps;
    },
    hideToastAction(state) {
      state.isVisible = false;
    },
  },
});

export const { showToastAction, hideToastAction } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;

export const selectToastSettings = createAppSelector((state) => state.toast);
