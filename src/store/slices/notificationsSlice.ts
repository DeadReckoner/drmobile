import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationsStateType {
  hasRequestBadge: boolean;
}

const initialState: NotificationsStateType = {
  hasRequestBadge: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setRequestBadgeAction(state, action: PayloadAction<boolean>) {
      state.hasRequestBadge = action.payload;
    },
  },
});

export const { setRequestBadgeAction } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;

export const selectHasRequestBadge = createAppSelector(
  (state) => state.notifications.hasRequestBadge,
);
