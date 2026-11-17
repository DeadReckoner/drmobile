interface OnboardingStepState {
  reviewToday: boolean;
  createOrReviewRoadmap: boolean;
  inviteFriend: boolean;
  addAnchor: boolean;
  completeTask: boolean;
}

interface OnboardingStateType {
  /**
   * The signed-in user this state belongs to. Onboarding state is kept on the
   * device and survives sign-out, so it has to be tied to an account.
   * Missing on state saved by app versions that did not track it.
   */
  userId?: string | null;
  hasSeenIntroModal: boolean;
  isSetupTaskCompleted: boolean;
  hasSeenRoadmapHighlight: boolean;
  setupSteps: OnboardingStepState;
}

export type { OnboardingStateType, OnboardingStepState };
