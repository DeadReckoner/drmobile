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
    updateMilestoneAction: (
      state,
      action: PayloadAction<Pick<MilestoneType, 'SubGoal' | 'Description'>>,
    ) => {
      const idx = state.roadmap.Milestones.findIndex(
        (m) => m.MilestoneId === state.selectedMilestone?.MilestoneId,
      );
      if (idx !== -1) {
        state.roadmap.Milestones[idx].SubGoal = action.payload.SubGoal;
        state.roadmap.Milestones[idx].Description = action.payload.Description;
      }
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
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === state.selectedMilestone?.MilestoneId,
      );
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
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === state.selectedMilestone?.MilestoneId,
      );
      if (!milestone) return;
      const idx = milestone.Tasks.findIndex(
        (t) => t.TaskId === state.selectedTask?.TaskId,
      );
      if (idx !== -1) {
        const { Title, Description } = action.payload;
        milestone.Tasks[idx].Title = Title;
        milestone.Tasks[idx].Description = Description;
      }
    },
    removeTaskAction: (state) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === state.selectedMilestone?.MilestoneId,
      );
      if (!milestone) return;
      milestone.Tasks = milestone.Tasks.filter(
        (t) => t.TaskId !== state.selectedTask?.TaskId,
      );
    },

    addStepAction: (
      state,
      action: PayloadAction<Pick<StepType, 'Description'>>,
    ) => {
      const milestone = state.roadmap.Milestones.find(
        (m) => m.MilestoneId === state.selectedTask?.MilestoneId,
      );
      if (!milestone) return;
      const task = milestone.Tasks.find(
        (t) => t.TaskId === state.selectedTask?.TaskId,
      );

      if (!task) return;
      const stepNumber = task.Steps.length + 1;
      task.Steps.push({
        ...action.payload,
        Completed: false,
        TaskId: task.TaskId,
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
