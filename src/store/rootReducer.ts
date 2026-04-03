import { api } from '@/store/apis/api';
import { aiRoadmapCreationReducer } from '@/store/slices/aiRoadmapCreationSlice';
import { authReducer } from '@/store/slices/authSlice';
import { notificationsReducer } from '@/store/slices/notificationsSlice';
import { onboardingReducer } from '@/store/slices/onboardingSlice';
import { draftRoadmapReducer } from '@/store/slices/roadmapDraftSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { settingsReducer } from './slices/settingsSlice';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  onboarding: onboardingReducer,
  roadmapDraft: draftRoadmapReducer,
  aiRoadmapCreation: aiRoadmapCreationReducer,
  notifications: notificationsReducer,
  [api.reducerPath]: api.reducer,
});
