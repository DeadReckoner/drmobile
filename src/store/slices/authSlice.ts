import { UserType } from '@/hooks/auth/types/auth.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { AuthStateType } from '@/store/types/authSlice.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthStateType = {
  isLoading: false,
  user: { id: '', avatar: '', email: '', name: '', access_token: '' },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoadingAction(state) {
      state.isLoading = true;
    },
    setAuthResolvedAction(state) {
      state.isLoading = false;
    },
    setAuthUserAction(state, action: PayloadAction<UserType>) {
      state.user = action.payload;
      state.isLoading = false;
    },
    clearAuthAction(state) {
      state.user = initialState.user;
      state.isLoading = false;
    },
  },
});

export const {
  setAuthLoadingAction,
  setAuthResolvedAction,
  setAuthUserAction,
  clearAuthAction,
} = authSlice.actions;

export const selectAuth = createAppSelector((state) => state.auth);
export const selectUser = createAppSelector((state) => state.auth.user);

export const authReducer = authSlice.reducer;
