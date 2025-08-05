import type {
  MilestoneType,
  RoadmapType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type DraftState = {
  roadmap: RoadmapType;
  selectedMilestone?: MilestoneType | null;
};

const getId = (type: 'roadmap' | 'milestone' | 'task') =>
  `${type}-${Date.now().toString()}`;

const initialState: DraftState = {
  roadmap: {
    RoadmapId: '',
    UserId: '',
    Goal: '',
    Description: '',
    Days: 0,
    Completed: false,
    StartDate: undefined,
    Milestones: [],
    Reason: '',
  },
  selectedMilestone: null,
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
        MilestoneId: getId('milestone'),
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
        TaskId: getId('task'),
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
    setSelectedMilestoneAction(
      state,
      action: PayloadAction<MilestoneType | null>,
    ) {
      state.selectedMilestone = action.payload;
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
  setSelectedMilestoneAction,
} = roadmapDraftSlice.actions;

export const selectDraftRoadmap = createAppSelector(
  (state) => state.roadmapDraft.roadmap,
);
export const selectSelectedMilestone = createAppSelector(
  (state) => state.roadmapDraft.selectedMilestone,
);
export const draftRoadmapReducer = roadmapDraftSlice.reducer;
