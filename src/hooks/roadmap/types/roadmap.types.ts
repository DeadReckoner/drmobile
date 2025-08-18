export type FormRoadmapType = Pick<
  RoadmapType,
  'goal' | 'description' | 'days' | 'reason'
>;

export type FormEditModeType = 'edit' | 'create';

export interface StepType {
  step_id: string;
  task_id: string;
  description: string;
  completed: boolean;
  number: number;
}

export interface TaskType {
  task_id: string;
  milestone_id: string;
  user_id?: string;
  title: string;
  description: string;
  day: number;
  completed: boolean;
  steps: StepType[];
}

export interface MilestoneType {
  milestone_id: string;
  roadmap_id: string;
  user_id?: string;
  sub_goal: string;
  description: string;
  day: number;
  reached: boolean;
  tasks: TaskType[];
}

export interface RoadmapType {
  roadmap_id: string;
  user_id?: string;
  goal: string;
  description: string;
  days: number;
  completed: boolean;
  start_date: string; // ISO string
  milestones: MilestoneType[];
  reason?: string;
}
