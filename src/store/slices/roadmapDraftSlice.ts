import type {
  MilestoneType,
  RoadmapType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

type DraftState = {
  roadmap: RoadmapType;
  selectedMilestone?: MilestoneType | null;
  selectedTask?: TaskType | null;
};

const getId = (type: 'roadmap' | 'milestone' | 'task') =>
  `${type}-${Date.now().toString()}`;

const initialState: DraftState = {
  roadmap: {
    roadmap_id: '',
    user_id: '',
    goal: '',
    description: '',
    days: 0,
    completed: false,
    start_date: dayjs().toString(),
    milestones: [],
    reason: '',
  },
  selectedMilestone: null,
  selectedTask: null,
};

const findSelectedMilestone = (state: DraftState) => {
  if (!state.selectedMilestone) return undefined;
  return state.roadmap.milestones.find(
    (m) => m.milestone_id === state.selectedMilestone!.milestone_id,
  );
};

const findSelectedTask = (state: DraftState) => {
  const milestone = findSelectedMilestone(state);
  if (!milestone || !state.selectedTask) return undefined;
  return milestone.tasks.find((t) => t.task_id === state.selectedTask!.task_id);
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
      action: PayloadAction<Partial<Omit<RoadmapType, 'milestones'>>>,
    ) => {
      Object.assign(state.roadmap, action.payload);
    },

    resetDraftAction: (state) => {
      state.roadmap = { ...initialState.roadmap };
    },

    addMilestoneAction: (
      state,
      action: PayloadAction<
        Omit<MilestoneType, 'milestone_id' | 'roadmap_id' | 'tasks'>
      >,
    ) => {
      state.roadmap.milestones.push({
        ...action.payload,
        milestone_id: getId('milestone'),
        roadmap_id: state.roadmap.roadmap_id,
        tasks: [],
      });
    },

    updateMilestoneAction: (
      state,
      action: PayloadAction<Pick<MilestoneType, 'sub_goal' | 'description'>>,
    ) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.sub_goal = action.payload.sub_goal;
      milestone.description = action.payload.description;
      state.selectedMilestone = milestone;
    },

    removeMilestoneAction: (state) => {
      state.roadmap.milestones = state.roadmap.milestones.filter(
        (m) => m.milestone_id !== state.selectedMilestone?.milestone_id,
      );
    },

    addTaskAction: (
      state,
      action: PayloadAction<Pick<TaskType, 'title' | 'description'>>,
    ) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.tasks.push({
        ...action.payload,
        task_id: getId('task'),
        milestone_id: milestone.milestone_id,
        steps: [],
        completed: false,
        day: 0,
      });
    },

    updateTaskAction: (
      state,
      action: PayloadAction<Pick<TaskType, 'title' | 'description'>>,
    ) => {
      const task = findSelectedTask(state);
      if (!task) return;
      task.title = action.payload.title;
      task.description = action.payload.description;
      syncSelectedTask(state);
    },

    removeTaskAction: (state) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.tasks = milestone.tasks.filter(
        (t) => t.task_id !== state.selectedTask?.task_id,
      );
    },

    addStepAction: (
      state,
      action: PayloadAction<Pick<StepType, 'description'>>,
    ) => {
      const task = findSelectedTask(state);
      if (!task) return;

      const newStep: StepType = {
        ...action.payload,
        completed: false,
        task_id: task.task_id,
        number: task.steps.length + 1,
        step_id: nanoid(),
      };

      task.steps.push(newStep);
      syncSelectedTask(state);
    },

    updateStepAction: (state, action: PayloadAction<Partial<StepType>>) => {
      const task = findSelectedTask(state);
      if (!task || action.payload.number == null) return;

      const idx = task.steps.findIndex(
        (s) => s.number === action.payload.number,
      );
      if (idx === -1) return;

      task.steps[idx] = { ...task.steps[idx], ...action.payload };
      syncSelectedTask(state);
    },

    removeStepAction: (state, action: PayloadAction<{ number: number }>) => {
      const task = findSelectedTask(state);
      if (!task) return;

      task.steps = task.steps.filter((s) => s.number !== action.payload.number);
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

    setDraftRoadmapAction(state, action: PayloadAction<RoadmapType>) {
      state.roadmap = action.payload;
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
  setDraftRoadmapAction,
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
