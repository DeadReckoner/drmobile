export type FormRoadmapType = Pick<
  RoadmapType,
  'goal' | 'description' | 'days' | 'reason'
>;

export type FormEditModeType = 'edit' | 'create' | 'view';

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
  date?: string;
  rationale?: string;
  est_minutes?: number;
  dependencies?: string; // Parse string to get array
  confidence?: string;
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

  // frontend calculated properties
  progress?: number;
  daysRemainingTillNextMilestone?: number;

  type?: 'custom_made' | 'ai_generated';
  macro_map?: MacroMap;
}

export interface MacroMap {
  macro_map_id: string;
  roadmap_id: string;
  phases: Phase[];
}

export interface Phase {
  phase_id: string;
  macro_map_id: string;
  name: string;
  description: string;
  order_index: number;
  duration_weeks: string;
  macro_milestones: MacroMilestone[];
}

export interface MacroMilestone {
  macro_milestone_id: string;
  phase_id: string;
  name: string;
  acceptance_test: string;
  duration_days_min: number;
  duration_days_max: number;
  order_index: number;
  resources_forecast: string; // JSON stringified object
  // resources_forecast: ResourcesForecast | string;
  spikes: Spike[];
  risks: Risk[];
}

export interface Spike {
  spike_id: string;
  macro_milestone_id: string;
  description: string;
  timebox_days: number;
}

export interface Risk {
  risk_id: string;
  macro_milestone_id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}
