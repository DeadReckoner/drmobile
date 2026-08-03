import {
  applyOptionsFailure,
  applyOptionsResult,
  emptyDraft,
  GoalDiscoveryDraft,
  GoalDiscoveryStage,
  GoalOptionsJobStatus,
  isDraftUsable,
} from '@/hooks/goalDiscovery/draft';
import {
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryStage1Values,
  GoalDiscoveryStage2Values,
  GoalOption,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import { emptyStage1Values } from '@/hooks/goalDiscovery/stage1';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { completeRoadmapCreationAction } from '@/store/slices/aiRoadmapCreationSlice';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Goal Discovery draft state.
 *
 * Persisted through the existing redux-persist root (this slice is NOT
 * blacklisted), which is what makes a half-finished form survive backgrounding
 * and app restarts. The reducers here are thin; the rules they apply live in
 * hooks/goalDiscovery/draft.ts so they can be tested without a store.
 */

interface GoalDiscoveryState {
  draft: GoalDiscoveryDraft;
}

const initialState: GoalDiscoveryState = {
  draft: emptyDraft(emptyStage1Values()),
};

const goalDiscoverySlice = createSlice({
  name: 'goalDiscovery',
  initialState,
  reducers: {
    /**
     * Claim the draft for the signed-in user, or reset it if it belongs to
     * somebody else (or to an incompatible build). Called when the feature is
     * opened, so a stale draft never renders even for a moment.
     */
    claimGoalDiscoveryDraftAction: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!isDraftUsable(state.draft, userId)) {
        state.draft = emptyDraft(emptyStage1Values());
      }
      state.draft.userId = userId;
    },

    setGoalDiscoveryStage1Action: (
      state,
      action: PayloadAction<GoalDiscoveryStage1Values>,
    ) => {
      state.draft.stage1 = action.payload;
      state.draft.updatedAt = Date.now();
    },

    setGoalDiscoveryStageAction: (
      state,
      action: PayloadAction<GoalDiscoveryStage>,
    ) => {
      state.draft.stage = action.payload;
    },

    /**
     * Record a submitted stage-1 generation. `regeneration` decides whether this
     * job replaces the current options or becomes them: a regeneration is
     * tracked separately so the existing three stay on screen until it succeeds.
     */
    startGoalOptionsJobAction: (
      state,
      action: PayloadAction<{
        jobId: string;
        answers: GoalDiscoveryAnswersPayload;
        idempotencyKey: string;
        regeneration: boolean;
      }>,
    ) => {
      const { jobId, answers, idempotencyKey, regeneration } = action.payload;
      state.draft.submittedAnswers = answers;
      state.draft.optionsIdempotencyKey = idempotencyKey;
      state.draft.regenerationFailed = false;
      state.draft.updatedAt = Date.now();

      if (regeneration) {
        state.draft.regenerationJobId = jobId;
        return;
      }

      state.draft.optionsJobId = jobId;
      state.draft.optionsJobStatus = 'pending';
      state.draft.options = [];
      state.draft.safetyMessage = null;
      state.draft.stage = 'options';
    },

    setGoalOptionsJobStatusAction: (
      state,
      action: PayloadAction<GoalOptionsJobStatus>,
    ) => {
      // A regeneration's progress must not overwrite the completed status of the
      // options currently on screen.
      if (state.draft.regenerationJobId) return;
      state.draft.optionsJobStatus = action.payload;
    },

    goalOptionsCompletedAction: (
      state,
      action: PayloadAction<{
        options: GoalOption[];
        safetyMessage: string | null;
      }>,
    ) => {
      state.draft = applyOptionsResult(
        state.draft,
        action.payload.options,
        action.payload.safetyMessage,
      );
      state.draft.updatedAt = Date.now();
    },

    goalOptionsFailedAction: (state) => {
      state.draft = applyOptionsFailure(state.draft);
      state.draft.updatedAt = Date.now();
    },

    /** Clear the "new options didn't generate" banner once acknowledged. */
    clearRegenerationFailureAction: (state) => {
      state.draft.regenerationFailed = false;
    },

    selectGoalOptionAction: (
      state,
      action: PayloadAction<{
        optionId: string;
        stage2: GoalDiscoveryStage2Values;
      }>,
    ) => {
      state.draft.selectedOptionId = action.payload.optionId;
      state.draft.stage2 = action.payload.stage2;
      state.draft.stage = 'stage2';
      // A new selection invalidates any key minted for the previous one.
      state.draft.roadmapIdempotencyKey = null;
      state.draft.updatedAt = Date.now();
    },

    setGoalDiscoveryStage2Action: (
      state,
      action: PayloadAction<GoalDiscoveryStage2Values>,
    ) => {
      state.draft.stage2 = action.payload;
      state.draft.updatedAt = Date.now();
    },

    startGoalDiscoveryRoadmapAction: (
      state,
      action: PayloadAction<{
        jobId: string;
        roadmapId: string;
        idempotencyKey: string;
      }>,
    ) => {
      state.draft.roadmapJobId = action.payload.jobId;
      state.draft.roadmapId = action.payload.roadmapId;
      state.draft.roadmapIdempotencyKey = action.payload.idempotencyKey;
      state.draft.updatedAt = Date.now();
    },

    /**
     * Mint (or reuse) the idempotency key for the final submission. Reusing it
     * across retries is what stops a retried submit creating a second roadmap.
     */
    setRoadmapIdempotencyKeyAction: (state, action: PayloadAction<string>) => {
      if (!state.draft.roadmapIdempotencyKey) {
        state.draft.roadmapIdempotencyKey = action.payload;
      }
    },

    /**
     * Clear everything. Used by "Start over" and by sign-out.
     *
     * Purely local: it abandons the draft, and never asks the server to delete
     * anything. A job already running simply finishes and is ignored.
     */
    resetGoalDiscoveryAction: () => initialState,
  },

  extraReducers: (builder) => {
    /**
     * Clear the draft once the roadmap it produced actually exists.
     *
     * The existing AI-roadmap flow marks completion with this action, so
     * reacting to it means the draft is discarded at exactly the moment the
     * roadmap becomes available through the normal app flow — not on submit
     * (a failed generation would lose the user's answers) and not on a timer.
     *
     * The roadmap id is compared so a completion from the chat flow never
     * clears a goal discovery draft that is still in progress.
     */
    builder.addCase(completeRoadmapCreationAction, (state, action) => {
      const { roadmapJobId, roadmapId } = state.draft;
      if (!roadmapJobId || !roadmapId) return state;
      if (action.payload?.roadmap_id !== roadmapId) return state;
      return initialState;
    });
  },
});

export const {
  claimGoalDiscoveryDraftAction,
  setGoalDiscoveryStage1Action,
  setGoalDiscoveryStageAction,
  startGoalOptionsJobAction,
  setGoalOptionsJobStatusAction,
  goalOptionsCompletedAction,
  goalOptionsFailedAction,
  clearRegenerationFailureAction,
  selectGoalOptionAction,
  setGoalDiscoveryStage2Action,
  startGoalDiscoveryRoadmapAction,
  setRoadmapIdempotencyKeyAction,
  resetGoalDiscoveryAction,
} = goalDiscoverySlice.actions;

export const selectGoalDiscoveryDraft = createAppSelector(
  (state) => state.goalDiscovery.draft,
);

export const selectGoalDiscoveryOptions = createAppSelector(
  (state) => state.goalDiscovery.draft.options,
);

export const selectSelectedGoalOption = createAppSelector((state) => {
  const { options, selectedOptionId } = state.goalDiscovery.draft;
  return options.find((option) => option.id === selectedOptionId) ?? null;
});

export const goalDiscoveryReducer = goalDiscoverySlice.reducer;
