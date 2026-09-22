import { api } from '@/store/apis/api';
import { aiRoadmapCreationReducer } from '@/store/slices/aiRoadmapCreationSlice';
import { authReducer } from '@/store/slices/authSlice';
import { billingReducer } from '@/store/slices/billingSlice';
import { nextMilestoneGenerationReducer } from '@/store/slices/nextMilestoneGenerationSlice';
import { planImportReducer } from '@/store/slices/planImportSlice';
import { notificationsReducer } from '@/store/slices/notificationsSlice';
import { onboardingReducer } from '@/store/slices/onboardingSlice';
import { draftRoadmapReducer } from '@/store/slices/roadmapDraftSlice';
import { toastReducer } from '@/store/slices/toastSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { settingsReducer } from './slices/settingsSlice';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  billing: billingReducer,
  auth: authReducer,
  onboarding: onboardingReducer,
  roadmapDraft: draftRoadmapReducer,
  aiRoadmapCreation: aiRoadmapCreationReducer,
  nextMilestoneGeneration: nextMilestoneGenerationReducer,
  planImport: planImportReducer,
  notifications: notificationsReducer,
  toast: toastReducer,
  [api.reducerPath]: api.reducer,
});
