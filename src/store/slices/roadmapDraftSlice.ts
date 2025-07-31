import {
  MilestoneType,
  RoadmapType,
  StepType,
  TaskType,
} from '@/hooks/create/types/roadmap.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type DraftState = {
  roadmap: RoadmapType;
};

const DRAFT_IDs = {
  roadmap: `Roadmap-${Date.now().toString()}`,
  milestone: `Roadmap-${Date.now().toString()}`,
  tasks: `Roadmap-${Date.now().toString()}`,
};

const initialState: DraftState = {
  roadmap: {
    RoadmapId: DRAFT_IDs.roadmap,
    UserId: '',
    Goal: '',
    Description: '',
    Days: 0,
    Completed: false,
    StartDate: undefined,
    Milestones: [],
    Reason: '',
  },
};

const roadmapDraftSlice = createSlice({
  name: 'roadmapDraft',
  initialState,
  reducers: {
    setMetaAction: (
      state,
      action: PayloadAction<Partial<Omit<RoadmapType, 'Milestones'>>>,
    ) => {
      state.roadmap = { ...state.roadmap, ...action.payload };
    },

    resetDraftAction: (state) => {
      state.roadmap = initialState.roadmap;
    },

    addMilestoneAction: (
      state,
      action: PayloadAction<
        Omit<MilestoneType, 'MilestoneId' | 'RoadmapId' | 'Tasks'>
      >,
    ) => {
      state.roadmap.Milestones.push({
        ...action.payload,
        MilestoneId: DRAFT_IDs.milestone,
        RoadmapId: state.roadmap.RoadmapId,
        Tasks: [],
      });
    },
    updateMilestoneAction: (state, action: PayloadAction<MilestoneType>) => {
      const idx = state.roadmap.Milestones.findIndex(
        (m) => m.MilestoneId === action.payload.MilestoneId,
      );
      if (idx !== -1) state.roadmap.Milestones[idx] = action.payload;
    },
    removeMilestoneAction: (state, action: PayloadAction<string>) => {
      state.roadmap.Milestones = state.roadmap.Milestones.filter(
        (m) => m.MilestoneId !== action.payload,
      );
    },

    addTaskAction: (
      state,
      action: PayloadAction<{
        milestoneId: string;
        task: Omit<TaskType, 'TaskId' | 'MilestoneId' | 'Steps'>;
      }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      milestone.Tasks.push({
        ...action.payload.task,
        TaskId: DRAFT_IDs.tasks,
        MilestoneId: action.payload.milestoneId,
        Steps: [],
      });
    },
    updateTaskAction: (
      state,
      action: PayloadAction<{ milestoneId: string; task: TaskType }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      const idx = milestone.Tasks.findIndex(
        (t) => t.TaskId === action.payload.task.TaskId,
      );
      if (idx !== -1) milestone.Tasks[idx] = action.payload.task;
    },
    removeTaskAction: (
      state,
      action: PayloadAction<{ milestoneId: string; taskId: string }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      milestone.Tasks = milestone.Tasks.filter(
        (t) => t.TaskId !== action.payload.taskId,
      );
    },

    addStepAction: (
      state,
      action: PayloadAction<{
        milestoneId: string;
        taskId: string;
        step: Omit<StepType, 'TaskId' | 'Number'>;
      }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      const task = milestone.Tasks.find(
        (t) => t.TaskId === action.payload.taskId,
      );
      if (!task) return;
      const stepNumber = task.Steps.length + 1;
      task.Steps.push({
        ...action.payload.step,
        TaskId: action.payload.taskId,
        Number: stepNumber,
      });
    },
    updateStepAction: (
      state,
      action: PayloadAction<{
        milestoneId: string;
        taskId: string;
        step: StepType;
      }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      const task = milestone.Tasks.find(
        (t) => t.TaskId === action.payload.taskId,
      );
      if (!task) return;
      const idx = task.Steps.findIndex(
        (s) => s.Number === action.payload.step.Number,
      );
      if (idx !== -1) task.Steps[idx] = action.payload.step;
    },
    removeStepAction: (
      state,
      action: PayloadAction<{
        milestoneId: string;
        taskId: string;
        number: number;
      }>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === action.payload.milestoneId,
      );
      if (!milestone) return;
      const task = milestone.Tasks.find(
        (t) => t.TaskId === action.payload.taskId,
      );
      if (!task) return;
      task.Steps = task.Steps.filter((s) => s.Number !== action.payload.number);
    },
  },
});

export const {
  setMetaAction,
  resetDraftAction,
  addMilestoneAction,
  updateMilestoneAction,
  removeMilestoneAction,
  addTaskAction,
  updateTaskAction,
  removeTaskAction,
  addStepAction,
  updateStepAction,
  removeStepAction,
} = roadmapDraftSlice.actions;

export const selectDraftRoadmap = createAppSelector(
  (state) => state.roadmapDraft.roadmap,
);

export const draftRoadmapReducer = roadmapDraftSlice.reducer;
