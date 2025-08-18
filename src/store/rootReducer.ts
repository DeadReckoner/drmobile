import { roadmapApi } from '@/store/apis/roadmapApi';
import { authReducer } from '@/store/slices/authSlice';
import { draftRoadmapReducer } from '@/store/slices/roadmapDraftSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { settingsReducer } from './slices/settingsSlice';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  roadmapDraft: draftRoadmapReducer,
  [roadmapApi.reducerPath]: roadmapApi.reducer,
});
