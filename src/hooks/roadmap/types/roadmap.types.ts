export type FormRoadmapType = Pick<
  RoadmapType,
  'goal' | 'description' | 'days' | 'reason'
>;

export type FormEditModeType = 'edit' | 'create' | 'view' | 'readonly';

export type RoadmapExecutionStatusType =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'overdue';

export type StepStatusType = 'incomplete' | 'completed' | 'skipped';

export interface StepType {
  step_id: string;
  task_id: string;
  description: string;

  /** @deprecated Use `status` instead. Will be removed in a future API version. */
  completed: boolean;
  number: number;
  status?: StepStatusType;
}

export interface TaskType {
  task_id: string;
  milestone_id: string;
  roadmap_id: string;
  user_id?: string;
  title: string;
  description: string;
  day: number;
  /** @deprecated Use `status` instead. Will be removed in a future API version. */
  completed?: boolean;
  steps: StepType[];
  date?: string;
  rationale?: string;
  est_minutes?: number;
  dependencies?: string; // Parse string to get array
  confidence?: string;

  status: RoadmapExecutionStatusType;
}

export interface MilestoneType {
  milestone_id: string;
  roadmap_id: string;
  user_id?: string;
  sub_goal: string;
  description: string;
  day: number;
  /** @deprecated Use `status` instead. Will be removed in a future API version. */
  reached?: boolean;
  tasks: TaskType[];
  date?: string;

  phase_id?: string;
  acceptance_test?: string;
  duration_days_min?: number;
  duration_days_max?: number;
  order_index?: number;
  resources_forecast?: string; // JSON stringified object

  spikes?: Spike[];
  risks?: Risk[];

  status: RoadmapExecutionStatusType;
}

type RoadmapGenerationStatusType =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

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
  phases?: Phase[];

  job_id?: string;
  generation_status?: RoadmapGenerationStatusType;

  anchor_id?: string;
  anchor?: {
    id: string;
    name: string;
    email: string;
  };

  archived?: boolean;
  paused_at?: string | null; // ISO 8601 UTC timestamp; null = not paused
  share_token?: string | null; // present on owned roadmaps; null = not shared
}

export interface Phase {
  phase_id: string;
  roadmap_id: string;
  name: string;
  description: string;
  order_index: number;
  duration_weeks: string;
  milestones?: MilestoneType[];
  status: RoadmapExecutionStatusType;
}

export interface Spike {
  spike_id: string;
  milestone_id: string;
  description: string;
  timebox_days: number;
}

export interface Risk {
  risk_id: string;
  milestone_id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RoadmapCreationJobResponse {
  job_id: string;
  message: string;
  roadmap_id: string;
  status: RoadmapGenerationStatusType;
  ws_url: string;
}

export interface RoadmapCreationJobStatusResponse {
  error: string;
  job_id: string;
  progress: number;
  status: RoadmapGenerationStatusType;

  result?: {
    roadmap_id: string;
  };
}

// ─── Next Milestone Generation ────────────────────────────────────────────────

export interface MilestoneReviewAnswers {
  completionStatus?: string;
  whatWorked?: string;
  whatDidntWork?: string;
  obstacles?: string;
  paceFeedback?: string;
  clarityFeedback?: string;
  goingForward?: string;
}

export interface GenerateNextMilestoneRequest {
  goalName: string;
  goalDescription: string;
  goalImportance: string;
  targetCompletionDate: string;
  weeklyTimeCommitment: string;
  workFrequency: string;
  constraints: string;
  currentSkillLevel: string;
  additionalContext: string;
  review: MilestoneReviewAnswers;
}

export interface NextMilestoneJobResponse {
  job_id: string;
  milestone_id: string;
  roadmap_id: string;
  status: RoadmapGenerationStatusType;
  message: string;
  ws_url: string;
}

export interface MilestoneJobProgressData {
  adjusted?: boolean;
  rationale?: string;
  milestone_id?: string;
  roadmap_id?: string;
  error?: string;
}

export interface MilestoneJobStatusFrameType {
  type: 'status' | 'progress' | 'complete' | 'error' | 'pong';
  job_id: string;
  status: RoadmapGenerationStatusType | 'failed';
  progress: number;
  message: string;
  data?: MilestoneJobProgressData;
}
