import {
  MilestoneType,
  RoadmapType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { HabitType } from '@/store/apis/types/habitsApi.types';

let _roadmap: RoadmapType | null = null;
let _tasks: TaskType[] | null = null;
let _task: TaskType | null = null;
let _habit: HabitType | null = null;

export function storeRoadmap(v: RoadmapType): void {
  _roadmap = v;
}
export function consumeRoadmap(): RoadmapType | null {
  const r = _roadmap;
  _roadmap = null;
  return r;
}

export function storeTasks(v: TaskType[]): void {
  _tasks = v;
}
export function consumeTasks(): TaskType[] | null {
  const r = _tasks;
  _tasks = null;
  return r;
}

export function storeTask(v: TaskType): void {
  _task = v;
}
export function consumeTask(): TaskType | null {
  const r = _task;
  _task = null;
  return r;
}

export function storeHabit(v: HabitType): void {
  _habit = v;
}
export function consumeHabit(): HabitType | null {
  const r = _habit;
  _habit = null;
  return r;
}

let _milestone: MilestoneType | null = null;
export function storeMilestone(v: MilestoneType): void {
  _milestone = v;
}
export function consumeMilestone(): MilestoneType | null {
  const r = _milestone;
  _milestone = null;
  return r;
}
