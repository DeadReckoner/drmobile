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

  const removeMilestoneItem = () => dispatch(removeMilestoneAction());

  const addTaskItem = (t: Pick<TaskType, 'Description' | 'Title'>) =>
    dispatch(addTaskAction(t));

  const updateTaskItem = (t: Pick<TaskType, 'Description' | 'Title'>) =>
    dispatch(updateTaskAction(t));

  const removeTaskItem = () => dispatch(removeTaskAction());

  const addStepItem = (s: Omit<StepType, 'TaskId' | 'Number'>) =>
    dispatch(addStepAction(s));

  const updateStepItem = (s: StepType) => dispatch(updateStepAction(s));

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
