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
  selectedTask?: TaskType | null;
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
  selectedTask: null,
};

const findSelectedMilestone = (state: DraftState) => {
  if (!state.selectedMilestone) return undefined;
  return state.roadmap.Milestones.find(
    (m) => m.MilestoneId === state.selectedMilestone!.MilestoneId,
  );
};

const findSelectedTask = (state: DraftState) => {
  const milestone = findSelectedMilestone(state);
  if (!milestone || !state.selectedTask) return undefined;
  return milestone.Tasks.find((t) => t.TaskId === state.selectedTask!.TaskId);
};

const syncSelectedTask = (state: DraftState) => {
  const task = findSelectedTask(state);
  if (task) state.selectedTask = task;
};

const roadmapDraftSlice = createSlice({
  name: 'roadmapDraft',
  initialState,
  reducers: {
    setMetaAction: (
      state,
      action: PayloadAction<Partial<Omit<RoadmapType, 'Milestones'>>>,
    ) => {
      Object.assign(state.roadmap, action.payload);
    },

    resetDraftAction: (state) => {
      state.roadmap = { ...initialState.roadmap };
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

    updateMilestoneAction: (
      state,
      action: PayloadAction<Pick<MilestoneType, 'SubGoal' | 'Description'>>,
    ) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.SubGoal = action.payload.SubGoal;
      milestone.Description = action.payload.Description;
      state.selectedMilestone = milestone;
    },

    removeMilestoneAction: (state) => {
      state.roadmap.Milestones = state.roadmap.Milestones.filter(
        (m) => m.MilestoneId !== state.selectedMilestone?.MilestoneId,
      );
    },

    addTaskAction: (
      state,
      action: PayloadAction<Pick<TaskType, 'Title' | 'Description'>>,
    ) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.Tasks.push({
        ...action.payload,
        TaskId: getId('task'),
        MilestoneId: milestone.MilestoneId,
        Steps: [],
        Completed: false,
        Day: 0,
      });
    },

    updateTaskAction: (
      state,
      action: PayloadAction<Pick<TaskType, 'Title' | 'Description'>>,
    ) => {
      const task = findSelectedTask(state);
      if (!task) return;
      task.Title = action.payload.Title;
      task.Description = action.payload.Description;
      syncSelectedTask(state);
    },

    removeTaskAction: (state) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.Tasks = milestone.Tasks.filter(
        (t) => t.TaskId !== state.selectedTask?.TaskId,
      );
    },

    addStepAction: (
      state,
      action: PayloadAction<Pick<StepType, 'Description'>>,
    ) => {
      const task = findSelectedTask(state);
      if (!task) return;

      const newStep: StepType = {
        ...action.payload,
        Completed: false,
        TaskId: task.TaskId,
        Number: task.Steps.length + 1,
      };

      task.Steps.push(newStep);
      syncSelectedTask(state);
    },

    updateStepAction: (state, action: PayloadAction<Partial<StepType>>) => {
      const task = findSelectedTask(state);
      if (!task || action.payload.Number == null) return;

      const idx = task.Steps.findIndex(
        (s) => s.Number === action.payload.Number,
      );
      if (idx === -1) return;

      task.Steps[idx] = { ...task.Steps[idx], ...action.payload };
      syncSelectedTask(state);
    },

    removeStepAction: (state, action: PayloadAction<{ number: number }>) => {
      const task = findSelectedTask(state);
      if (!task) return;

      task.Steps = task.Steps.filter((s) => s.Number !== action.payload.number);
      syncSelectedTask(state);
    },

    setSelectedMilestoneAction(
      state,
      action: PayloadAction<MilestoneType | null>,
    ) {
      state.selectedMilestone = action.payload;
    },

    setSelectedTaskAction(state, action: PayloadAction<TaskType | null>) {
      state.selectedTask = action.payload;
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
  setSelectedTaskAction,
} = roadmapDraftSlice.actions;

export const selectDraftRoadmap = createAppSelector(
  (state) => state.roadmapDraft.roadmap,
);
export const selectSelectedMilestone = createAppSelector(
  (state) => state.roadmapDraft.selectedMilestone,
);
export const selectSelectedTask = createAppSelector(
  (state) => state.roadmapDraft.selectedTask,
);

export const draftRoadmapReducer = roadmapDraftSlice.reducer;
