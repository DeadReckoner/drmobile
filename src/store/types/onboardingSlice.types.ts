interface OnboardingStepState {
  reviewToday: boolean;
  createOrReviewRoadmap: boolean;
  inviteFriend: boolean;
  addAnchor: boolean;
  completeTask: boolean;
}

interface OnboardingStateType {
  hasSeenIntroModal: boolean;
  isSetupTaskCompleted: boolean;
  hasSeenRoadmapHighlight: boolean;
  setupSteps: OnboardingStepState;
}

export type { OnboardingStateType, OnboardingStepState };
