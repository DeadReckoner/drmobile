import { createAppSelector } from '@/store/hooks/store.hooks';
import type {
  OnboardingStateType,
  OnboardingStepState,
} from '@/store/types/onboardingSlice.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: OnboardingStateType = {
  userId: null,
  hasSeenIntroModal: false,
  isSetupTaskCompleted: false,
  hasSeenRoadmapHighlight: false,
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
    markRoadmapHighlightSeenAction(state) {
      state.hasSeenRoadmapHighlight = true;
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
    /**
     * Reconcile the device's onboarding state with the profile the server
     * just returned. Runs on every profile fetch.
     *
     * The welcome screens are a per-device, per-account "seen" flag. This used
     * to clear that flag whenever the server said onboarding was not complete,
     * so anyone who had not finished the setup checklist got the welcome
     * screens again on every app launch and every profile refetch. The flag is
     * now only reset when a different account signs in on this device.
     */
    syncOnboardingWithServerAction(
      state,
      action: PayloadAction<{ userId: string; onboardingCompleted?: boolean }>,
    ) {
      const { userId, onboardingCompleted } = action.payload;

      if (state.userId && state.userId !== userId) {
        // Another account's onboarding state is still in memory.
        state.hasSeenIntroModal = initialState.hasSeenIntroModal;
        state.hasSeenRoadmapHighlight = initialState.hasSeenRoadmapHighlight;
        state.setupSteps = { ...initialState.setupSteps };
      }
      state.userId = userId;

      if (onboardingCompleted === true) {
        state.isSetupTaskCompleted = true;
      } else if (onboardingCompleted === false) {
        state.isSetupTaskCompleted = false;
      }
    },
  },
});

export const {
  markIntroModalSeenAction,
  markRoadmapHighlightSeenAction,
  toggleSetupStepAction,
  setSetupStepAction,
  completeSetupTaskAction,
  syncOnboardingWithServerAction,
} = onboardingSlice.actions;

export const selectHasSeenIntroModal = createAppSelector(
  (state) => state.onboarding.hasSeenIntroModal,
);

export const selectIsSetupTaskCompleted = createAppSelector(
  (state) => state.onboarding.isSetupTaskCompleted,
);

export const selectHasSeenRoadmapHighlight = createAppSelector(
  (state) => state.onboarding.hasSeenRoadmapHighlight,
);

export const selectSetupSteps = createAppSelector(
  (state) => state.onboarding.setupSteps,
);

export const selectAreAllSetupStepsCompleted = createAppSelector((state) =>
  Object.values(state.onboarding.setupSteps).every((step) => step === true),
);

export const onboardingReducer = onboardingSlice.reducer;
