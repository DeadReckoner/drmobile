import { createAppSelector } from '@/store/hooks/store.hooks';
import type {
  OnboardingStateType,
  OnboardingStepState,
} from '@/store/types/onboardingSlice.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: OnboardingStateType = {
  hasSeenIntroModal: false,
  isSetupTaskCompleted: false,
  setupSteps: {
    reviewToday: true,
    createOrReviewRoadmap: false,
    inviteFriend: false,
    addAnchor: false,
    completeTask: false,
  },
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    markIntroModalSeenAction(state) {
      state.hasSeenIntroModal = true;
    },
    toggleSetupStepAction(
      state,
      action: PayloadAction<keyof OnboardingStepState>,
    ) {
      const stepKey = action.payload;
      state.setupSteps[stepKey] = !state.setupSteps[stepKey];
    },
    setSetupStepAction(
      state,
      action: PayloadAction<{ key: keyof OnboardingStepState; value: boolean }>,
    ) {
      const { key, value } = action.payload;
      state.setupSteps[key] = value;
    },
    completeSetupTaskAction(state) {
      state.isSetupTaskCompleted = true;
    },
    resetOnboardingAction: () => initialState,
  },
});

export const {
  markIntroModalSeenAction,
  toggleSetupStepAction,
  setSetupStepAction,
  completeSetupTaskAction,
  resetOnboardingAction,
} = onboardingSlice.actions;

export const selectHasSeenIntroModal = createAppSelector(
  (state) => state.onboarding.hasSeenIntroModal,
);

export const selectIsSetupTaskCompleted = createAppSelector(
  (state) => state.onboarding.isSetupTaskCompleted,
);

export const selectSetupSteps = createAppSelector(
  (state) => state.onboarding.setupSteps,
);

export const selectAreAllSetupStepsCompleted = createAppSelector((state) =>
  Object.values(state.onboarding.setupSteps).every((step) => step === true),
);

export const onboardingReducer = onboardingSlice.reducer;
