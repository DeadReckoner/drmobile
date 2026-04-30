import {
  MilestoneJobStatusFrameType,
  NextMilestoneJobResponse,
} from '@/hooks/roadmap/types/roadmap.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NextMilestoneGenerationStatus =
  | 'idle'
  | 'submitting'
  | 'generating'
  | 'completed'
  | 'error';

interface NextMilestoneGenerationState {
  status: NextMilestoneGenerationStatus;
  milestoneId: string | null;
  roadmapId: string | null;
  jobResponse: NextMilestoneJobResponse | null;
  jobStatusResponse: MilestoneJobStatusFrameType | null;
  adjustedRationale: string | null;
  error: string | null;
}

const initialState: NextMilestoneGenerationState = {
  status: 'idle',
  milestoneId: null,
  roadmapId: null,
  jobResponse: null,
  jobStatusResponse: null,
  adjustedRationale: null,
  error: null,
};

const nextMilestoneGenerationSlice = createSlice({
  name: 'nextMilestoneGeneration',
  initialState,
  reducers: {
    startSubmittingAction: (
      state,
      action: PayloadAction<{ milestoneId: string; roadmapId: string }>,
    ) => {
      state.status = 'submitting';
      state.milestoneId = action.payload.milestoneId;
      state.roadmapId = action.payload.roadmapId;
      state.jobResponse = null;
      state.jobStatusResponse = null;
      state.adjustedRationale = null;
      state.error = null;
    },

    startGeneratingAction: (
      state,
      action: PayloadAction<NextMilestoneJobResponse>,
    ) => {
      state.status = 'generating';
      state.jobResponse = action.payload;
      state.error = null;
    },

    setMilestoneJobStatusAction: (
      state,
      action: PayloadAction<MilestoneJobStatusFrameType>,
    ) => {
      state.jobStatusResponse = action.payload;
    },

    setAdjustedRationaleAction: (state, action: PayloadAction<string>) => {
      state.adjustedRationale = action.payload;
    },

    completeMilestoneGenerationAction: (state) => {
      state.status = 'completed';
      state.error = null;
    },

    setMilestoneGenerationErrorAction: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.status = 'error';
      state.error = action.payload;
      state.jobResponse = null;
      state.jobStatusResponse = null;
    },

    resetMilestoneGenerationAction: () => initialState,
  },
});

export const {
  startSubmittingAction,
  startGeneratingAction,
  setMilestoneJobStatusAction,
  setAdjustedRationaleAction,
  completeMilestoneGenerationAction,
  setMilestoneGenerationErrorAction,
  resetMilestoneGenerationAction,
} = nextMilestoneGenerationSlice.actions;

// Selectors
export const selectNextMilestoneGenerationState = createAppSelector(
  (state) => state.nextMilestoneGeneration,
);

export const selectNextMilestoneGenerationStatus = createAppSelector(
  (state) => state.nextMilestoneGeneration.status,
);

export const selectNextMilestoneJobResponse = createAppSelector(
  (state) => state.nextMilestoneGeneration.jobResponse,
);

export const selectNextMilestoneJobStatusResponse = createAppSelector(
  (state) => state.nextMilestoneGeneration.jobStatusResponse,
);

export const selectAdjustedRationale = createAppSelector(
  (state) => state.nextMilestoneGeneration.adjustedRationale,
);

export const selectNextMilestoneRoadmapId = createAppSelector(
  (state) => state.nextMilestoneGeneration.roadmapId,
);

export const selectNextMilestoneMilestoneId = createAppSelector(
  (state) => state.nextMilestoneGeneration.milestoneId,
);

/**
 * Returns true if the given milestoneId is currently being generated
 * (status is 'generating' or 'submitting').
 */
export const selectIsNextMilestoneGenerating = (milestoneId: string) =>
  createAppSelector((state) => {
    const { status, milestoneId: activeMilestoneId } =
      state.nextMilestoneGeneration;
    return (
      activeMilestoneId === milestoneId &&
      (status === 'generating' || status === 'submitting')
    );
  });

/**
 * Returns true if the given milestoneId just completed generation.
 */
export const selectIsNextMilestoneCompleted = (milestoneId: string) =>
  createAppSelector((state) => {
    const { status, milestoneId: activeMilestoneId } =
      state.nextMilestoneGeneration;
    return activeMilestoneId === milestoneId && status === 'completed';
  });

export const nextMilestoneGenerationReducer =
  nextMilestoneGenerationSlice.reducer;
export const nextMilestoneGenerationSlicePath =
  nextMilestoneGenerationSlice.reducerPath;
