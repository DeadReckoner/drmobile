import type {
  MilestoneType,
  RoadmapType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addMilestoneAction,
  addStepAction,
  addTaskAction,
  removeMilestoneAction,
  removeStepAction,
  removeTaskAction,
  resetDraftAction,
  selectDraftRoadmap,
  setMetaAction,
  updateMilestoneAction,
  updateStepAction,
  updateTaskAction,
} from '@/store/slices/roadmapDraftSlice';

export const useDraftRoadmapBuilder = () => {
  const dispatch = useAppDispatch();
  const roadmap = useAppSelector(selectDraftRoadmap);
  const milestones = roadmap?.Milestones ?? [];

  const setRoadmapMetadata = (
    meta: Partial<Omit<RoadmapType, 'Milestones'>>,
  ) => {
    dispatch(setMetaAction(meta));
  };

  const reset = () => dispatch(resetDraftAction());

  const addMilestoneItem = (
    m: Omit<MilestoneType, 'MilestoneId' | 'RoadmapId' | 'Tasks'>,
  ) => dispatch(addMilestoneAction(m));

  const updateMilestoneItem = (m: MilestoneType) =>
    dispatch(updateMilestoneAction(m));

  const removeMilestoneItem = (milestoneId: string) =>
    dispatch(removeMilestoneAction(milestoneId));

  const addTaskItem = (
    milestoneId: string,
    t: Omit<TaskType, 'TaskId' | 'MilestoneId' | 'Steps'>,
  ) => dispatch(addTaskAction({ milestoneId, task: t }));

  const updateTaskItem = (milestoneId: string, t: TaskType) =>
    dispatch(updateTaskAction({ milestoneId, task: t }));

  const removeTaskItem = (milestoneId: string, taskId: string) =>
    dispatch(removeTaskAction({ milestoneId, taskId }));

  const addStepItem = (
    milestoneId: string,
    taskId: string,
    s: Omit<StepType, 'TaskId' | 'Number'>,
  ) => dispatch(addStepAction({ milestoneId, taskId, step: s }));

  const updateStepItem = (milestoneId: string, taskId: string, s: StepType) =>
    dispatch(updateStepAction({ milestoneId, taskId, step: s }));

  const removeStepItem = (
    milestoneId: string,
    taskId: string,
    number: number,
  ) => dispatch(removeStepAction({ milestoneId, taskId, number }));

  const tasks = (milestoneId: string) =>
    milestones.find((m) => m.MilestoneId === milestoneId)?.Tasks || [];

  const steps = (milestoneId: string, taskId: string) =>
    milestones
      .find((m) => m.MilestoneId === milestoneId)
      ?.Tasks.find((t) => t.TaskId === taskId)?.Steps || [];

  return {
    roadmap,
    setRoadmapMetadata,
    reset,
    milestones,
    addMilestone: addMilestoneItem,
    updateMilestone: updateMilestoneItem,
    removeMilestone: removeMilestoneItem,
    tasks,
    addTask: addTaskItem,
    updateTask: updateTaskItem,
    removeTask: removeTaskItem,
    steps,
    addStep: addStepItem,
    updateStep: updateStepItem,
    removeStep: removeStepItem,
  };
};
