import { authReducer } from '@/store/slices/authSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { settingsReducer } from './slices/settingsSlice';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
});
