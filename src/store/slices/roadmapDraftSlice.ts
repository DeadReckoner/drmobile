import type {
  MilestoneType,
  RoadmapType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { transformRoadmap } from '@/utils/roadmap.utils';
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

type DraftState = {
  roadmap: RoadmapType;
  selectedMilestone?: MilestoneType | null;
  selectedTask?: TaskType | null;
  selectedHabit?: HabitType | null;
  selectedStep?: StepType | null;

  selectedRoadmapIndex: number;
  selectedMilestoneIndex: number;
  selectedTaskIndex: number;
  selectedStepIndex: number;
  shouldSyncWithServer: boolean;
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
    start_date: '',
    milestones: [],
    reason: '',
  },
  selectedMilestone: null,
  selectedTask: null,
  selectedStep: null,
  selectedHabit: null,

  selectedRoadmapIndex: -1,
  selectedMilestoneIndex: -1,
  selectedTaskIndex: -1,
  selectedStepIndex: -1,
  shouldSyncWithServer: false,
};

const findSelectedMilestone = (state: DraftState) => {
  if (!state.selectedMilestone) return undefined;
  return state.roadmap.milestones.find(
    (m) => m.milestone_id === state.selectedMilestone?.milestone_id,
  );
};

const findSelectedTask = (state: DraftState) => {
  const milestone = findSelectedMilestone(state);
  if (!milestone || !state.selectedTask) return undefined;
  return milestone.tasks.find((t) => t.task_id === state.selectedTask?.task_id);
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
      state.selectedMilestone = null;
      state.selectedTask = null;
      state.selectedStep = null;
      state.selectedRoadmapIndex = -1;
      state.selectedMilestoneIndex = -1;
      state.selectedTaskIndex = -1;
      state.selectedStepIndex = -1;
      state.shouldSyncWithServer = false;
    },

    addMilestoneAction: (
      state,
      action: PayloadAction<
        Omit<MilestoneType, 'milestone_id' | 'roadmap_id' | 'tasks'> & {
          milestone_id?: string;
        }
      >,
    ) => {
      state.roadmap.milestones.push({
        ...action.payload,
        milestone_id: action.payload.milestone_id ?? getId('milestone'),
        roadmap_id: state.roadmap.roadmap_id,
        tasks: [],
      });
    },

    updateMilestoneAction: (
      state,
      action: PayloadAction<Pick<MilestoneType, 'sub_goal' | 'description'>>,
    ) => {
      let milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone = { ...milestone, ...action.payload };
      state.selectedMilestone = milestone;
      const index = state.roadmap.milestones.findIndex(
        (m) => m.milestone_id === milestone.milestone_id,
      );
      if (index !== -1) {
        state.roadmap.milestones[index] = milestone;
      }
    },

    removeMilestoneAction: (state) => {
      state.roadmap.milestones = state.roadmap.milestones.filter(
        (m) => m.milestone_id !== state.selectedMilestone?.milestone_id,
      );
      state.selectedMilestoneIndex = -1;
      state.selectedTaskIndex = -1;
      state.selectedStepIndex = -1;
      state.selectedMilestone = null;
      state.selectedTask = null;
      state.selectedStep = null;
    },

    addTaskAction: (
      state,
      action: PayloadAction<
        Pick<TaskType, 'title' | 'description'> & { task_id?: string }
      >,
    ) => {
      const milestone = findSelectedMilestone(state);
      if (!milestone) return;
      milestone.tasks?.push({
        ...action.payload,
        task_id: action.payload.task_id ?? getId('task'),
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
      milestone.tasks =
        milestone.tasks?.filter(
          (t) => t.task_id !== state.selectedTask?.task_id,
        ) || [];
      state.selectedTaskIndex = -1;
      state.selectedStepIndex = -1;
      state.selectedTask = null;
      state.selectedStep = null;
    },

    addStepAction: (
      state,
      action: PayloadAction<
        Pick<StepType, 'description'> & { task_id?: string; step_id?: string }
      >,
    ) => {
      const task = findSelectedTask(state);
      if (!task) return;

      const newStep: StepType = {
        ...action.payload,
        completed: false,
        task_id: action.payload.task_id || task.task_id,
        number: task.steps.length + 1,
        step_id: action.payload.step_id || nanoid(),
      };

      task.steps.push(newStep);
      syncSelectedTask(state);
    },

    updateStepAction: (
      state,
      action: PayloadAction<Partial<StepType> & { index?: number }>,
    ) => {
      state.selectedStepIndex = action.payload.index ?? state.selectedStepIndex;
      const task = findSelectedTask(state);
      if (!task) return;
      const step = task.steps[action.payload.index ?? state.selectedStepIndex];

      if (!step) return;
      step.description = action.payload.description ?? step.description;

      if (action.payload.completed === undefined) {
        step.completed = false;
      } else {
        step.completed = action.payload.completed;
      }
      step.number = action.payload.number ?? step.number;
      if (!task) return;
      if (task) {
        if (
          task.steps?.every((s) => s.completed) ||
          !task.steps ||
          task.steps?.length === 0
        ) {
          task.completed = true;
        } else {
          task.completed = false;
        }
      }
      const milestone = findSelectedMilestone(state);
      if (milestone) {
        if (milestone?.tasks?.every((t) => t.completed)) {
          milestone.reached = true;
        } else {
          milestone.reached = false;
        }
      }

      syncSelectedTask(state);
      state.roadmap = transformRoadmap(state.roadmap);
      state.selectedStep = step;
      state.selectedTask = task;
      state.selectedMilestone = milestone;
    },

    removeStepAction: (state, action: PayloadAction<{ step_id: string }>) => {
      const task = findSelectedTask(state);
      if (!task) return;
      task.steps = task.steps.filter(
        (s) => s.step_id !== action.payload.step_id,
      );
      syncSelectedTask(state);
      state.selectedStepIndex = -1;
      state.selectedStep = null;
    },
    setSelectedMilestoneAction(
      state,
      action: PayloadAction<{
        milestone: MilestoneType | null;
        index?: number;
      }>,
    ) {
      state.selectedMilestone = action.payload.milestone;
      if (action.payload.index !== undefined) {
        state.selectedMilestoneIndex = action.payload.milestone
          ? action.payload.index
          : -1;
      }
    },

    setSelectedTaskAction(
      state,
      action: PayloadAction<{ task: TaskType | null; index?: number }>,
    ) {
      state.selectedTask = action.payload.task;
      if (action.payload.index !== undefined) {
        state.selectedTaskIndex = action.payload.task
          ? action.payload.index
          : -1;
      }
    },

    setSelectedStepAction(
      state,
      action: PayloadAction<{ step: StepType | null; index?: number }>,
    ) {
      state.selectedStep = action.payload.step;
      if (action.payload.index !== undefined) {
        state.selectedStepIndex = action.payload.step
          ? action.payload.index
          : -1;
      }
    },

    setDraftRoadmapAction(state, action: PayloadAction<RoadmapType>) {
      const roadmap: RoadmapType = {
        ...action.payload,
        milestones: action.payload.milestones.map((milestone) => {
          const milestoneId = nanoid();
          return {
            ...milestone,
            milestone_id: milestone.milestone_id || milestoneId,
            tasks:
              milestone.tasks?.map((task) => {
                const taskId = nanoid();
                return {
                  ...task,
                  task_id: task.task_id || taskId,
                  steps:
                    task.steps?.map((step) => {
                      const stepId = nanoid();
                      return {
                        ...step,
                        step_id: step.step_id || stepId,
                      };
                    }) || [],
                };
              }) || [],
          };
        }),
      };
      state.roadmap = roadmap;
    },

    setShouldSyncWithServerAction(state, action: PayloadAction<boolean>) {
      state.shouldSyncWithServer = action.payload;
    },
    setSelectedRoadmapIndex(state, action: PayloadAction<number>) {
      state.selectedRoadmapIndex = action.payload ?? -1;
      state.selectedMilestoneIndex = -1;
      state.selectedTaskIndex = -1;
      state.selectedStepIndex = -1;
    },
    setSelectedMilestoneIndex(state, action: PayloadAction<number>) {
      state.selectedMilestoneIndex = action.payload ?? -1;
      state.selectedTaskIndex = -1;
      state.selectedStepIndex = -1;
    },
    setSelectedTaskIndex(state, action: PayloadAction<number>) {
      state.selectedTaskIndex = action.payload ?? -1;
      state.selectedStepIndex = -1;
    },
    setSelectedStepIndex(state, action: PayloadAction<number>) {
      state.selectedStepIndex = action.payload ?? -1;
    },
    setSelectedHabit(state, action: PayloadAction<HabitType | null>) {
      state.selectedHabit = action.payload;
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
  setSelectedStepAction,
  setDraftRoadmapAction,
  setShouldSyncWithServerAction,
  setSelectedRoadmapIndex,
  setSelectedMilestoneIndex,
  setSelectedTaskIndex,
  setSelectedStepIndex,
  setSelectedHabit,
} = roadmapDraftSlice.actions;

export const selectDraftSlice = createAppSelector(
  (state) => state.roadmapDraft,
);

export const selectDraftRoadmap = createAppSelector(
  (state) => state.roadmapDraft.roadmap,
);
export const selectSelectedMilestone = createAppSelector(
  (state) => state.roadmapDraft.selectedMilestone,
);
export const selectSelectedTask = createAppSelector(
  (state) => state.roadmapDraft.selectedTask,
);
export const selectSelectedHabit = createAppSelector(
  (state) => state.roadmapDraft.selectedHabit,
);
export const selectSelectedStep = createAppSelector(
  (state) => state.roadmapDraft.selectedStep,
);

export const draftRoadmapReducer = roadmapDraftSlice.reducer;
export const roadmapDraftSlicePath = roadmapDraftSlice.reducerPath;
