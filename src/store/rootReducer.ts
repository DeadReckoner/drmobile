import { api } from '@/store/apis/api';
import { aiRoadmapCreationReducer } from '@/store/slices/aiRoadmapCreationSlice';
import { authReducer } from '@/store/slices/authSlice';
import { draftRoadmapReducer } from '@/store/slices/roadmapDraftSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { settingsReducer } from './slices/settingsSlice';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  roadmapDraft: draftRoadmapReducer,
  aiRoadmapCreation: aiRoadmapCreationReducer,
  [api.reducerPath]: api.reducer,
});
