/**
 * Goal Discovery contract types.
 *
 * Every value sent to the server is a stable machine-readable enum; the display
 * copy lives in the translation files and is looked up by key. The UI never
 * sends a label as data.
 *
 * The limits and enum values below MIRROR drserver/types/goal_discovery.go.
 * Both sides validate independently, so the two must be changed together — the
 * server is the authority, this exists so the user is told about a problem
 * before a round trip rather than after one.
 */

/** Bump together with GoalDiscoverySchemaVersion on the server. */
export const GOAL_DISCOVERY_SCHEMA_VERSION = 1;

/** Mirrors the server's free-text bounds. */
export const GoalDiscoveryLimits = {
  shortText: 500,
  title: 300,
  longText: 2000,
  detailText: 3000,
  customPace: 250,
  maxAreas: 3,
  maxOutcomes: 2,
  optionCount: 3,
} as const;

// ─── Stage 1 ─────────────────────────────────────────────────────────────────

export type GoalDiscoveryTrigger =
  | 'feel_stuck'
  | 'want_more_discipline'
  | 'want_to_build_something'
  | 'want_to_get_healthier'
  | 'want_to_make_more_money'
  | 'want_a_new_hobby'
  | 'want_to_feel_proud'
  | 'something_needs_to_change';

export type GoalDiscoveryArea =
  | 'career'
  | 'business'
  | 'money'
  | 'learning'
  | 'creativity'
  | 'relationships'
  | 'health'
  | 'home_environment'
  | 'confidence'
  | 'discipline'
  | 'adventure_fun'
  | 'purpose_direction';

export type GoalDiscoverySelfDescription =
  | 'know_but_dont_do'
  | 'too_many_ideas'
  | 'dont_know_where_to_start'
  | 'start_and_quit'
  | 'fine_but_want_harder_target'
  | 'need_a_win';

export type GoalDiscoveryOutcome =
  | 'build_confidence'
  | 'create_income'
  | 'reduce_stress'
  | 'build_discipline'
  | 'learn_useful_skill'
  | 'create_something_tangible'
  | 'become_more_interesting'
  | 'fix_ignored_problem'
  | 'prove_follow_through'
  | 'improve_health';

export type GoalDiscoveryTargetType =
  | 'easy_win'
  | 'steady_habit'
  | 'serious_challenge'
  | 'skill_building_project'
  | 'money_making_project'
  | 'life_cleanup'
  | 'new_experience'
  | 'open_to_best_fit';

/**
 * Stage 1 form state. Single-selects are nullable while unanswered so an
 * unanswered question is distinguishable from a deliberately chosen value.
 */
export interface GoalDiscoveryStage1Values {
  trigger: GoalDiscoveryTrigger | null;
  triggerNote: string;
  areas: GoalDiscoveryArea[];
  customArea: string;
  selfDescription: GoalDiscoverySelfDescription | null;
  recurringThought: string;
  successDefinition: string;
  outcomes: GoalDiscoveryOutcome[];
  customOutcome: string;
  targetType: GoalDiscoveryTargetType | null;
}

/** The normalized wire shape. Matches types.GoalDiscoveryAnswers on the server. */
export interface GoalDiscoveryAnswersPayload {
  schema_version: number;
  trigger: GoalDiscoveryTrigger;
  trigger_note?: string;
  areas: GoalDiscoveryArea[];
  custom_area?: string;
  self_description: GoalDiscoverySelfDescription;
  recurring_thought: string;
  success_definition: string;
  outcomes: GoalDiscoveryOutcome[];
  custom_outcome?: string;
  target_type: GoalDiscoveryTargetType;
}

// ─── Generated options ───────────────────────────────────────────────────────

export type GoalOptionPace = 'focused' | 'steady' | 'light';

export type GoalOptionDifficultyLevel =
  | 'starter'
  | 'moderate'
  | 'demanding'
  | 'intense';

export type GoalOptionAccountabilityLevel = 'low' | 'moderate' | 'high';

export interface GoalOptionEffort {
  pace: GoalOptionPace;
  hours_per_week_min: number;
  hours_per_week_max: number;
  estimated_duration_months_min: number;
  estimated_duration_months_max: number;
  display_text: string;
}

export interface GoalOption {
  id: string;
  rank: number;
  goal_title: string;
  why_this_fits: string;
  target_outcome: string;
  why_worth_pursuing: string;
  effort_examples: GoalOptionEffort[];
  difficulty: { level: GoalOptionDifficultyLevel; explanation: string };
  accountability_strength: {
    level: GoalOptionAccountabilityLevel;
    explanation: string;
  };
}

/** Set instead of options when the model flags crisis or imminent-harm content. */
export interface GoalOptionsSafety {
  blocked: boolean;
  reason: string;
  message: string;
}

export interface GoalOptionsResult {
  options: GoalOption[];
  prompt_version: string;
  generated_at: string;
  safety?: GoalOptionsSafety;
}

// ─── Stage 2 ─────────────────────────────────────────────────────────────────

export type GoalDiscoveryConstraint =
  | 'limited_time'
  | 'limited_budget'
  | 'low_energy'
  | 'lack_of_experience'
  | 'motivation_consistency'
  | 'overthinking_procrastination'
  | 'privacy_concerns'
  | 'need_accountability'
  | 'need_beginner_friendly_steps'
  | 'need_flexibility'
  | 'need_simplicity'
  | 'physical_limitations'
  | 'equipment_tools_space_access'
  | 'other'
  | 'no_major_constraints';

/**
 * The one constraint that is mutually exclusive with every other. Selecting it
 * clears the rest; selecting any real constraint clears it.
 */
export const NO_MAJOR_CONSTRAINTS: GoalDiscoveryConstraint =
  'no_major_constraints';

export const CONSTRAINT_OTHER: GoalDiscoveryConstraint = 'other';

export type GoalDiscoveryWeeklyPreset =
  | 'ten_minutes_day'
  | 'thirty_minutes_day'
  | 'two_to_three_sessions_week'
  | 'four_to_six_hours_week'
  | 'seven_to_ten_hours_week'
  | 'ten_plus_hours_week'
  | 'custom';

/** Which axis the user chose to control under "Custom pace/deadline". */
export type GoalDiscoveryPaceControl = 'deadline' | 'weekly';

/**
 * Stage 2 pace form state. Deliberately holds all three branches so switching
 * between them and back does not silently lose what was already typed; only the
 * fields belonging to the active branch are serialized.
 */
export interface GoalDiscoveryPaceValues {
  /** null = nothing chosen yet; a pace = one of the generated lanes. */
  selectedPace: GoalOptionPace | null;
  /** true when "Custom pace/deadline" is chosen instead of a generated lane. */
  isCustom: boolean;
  control: GoalDiscoveryPaceControl | null;
  /** Date-only, YYYY-MM-DD, in the user's local calendar. Never a timestamp. */
  targetDate: string;
  weeklyPreset: GoalDiscoveryWeeklyPreset | null;
  customWeeklyDescription: string;
}

export interface GoalDiscoveryStage2Values {
  selectedGoal: string;
  completionDefinition: string;
  whyNow: string;
  pace: GoalDiscoveryPaceValues;
  baseline: string;
  constraints: GoalDiscoveryConstraint[];
  constraintDetails: string;
  additionalContext: string;
}

/** Discriminated union sent to the server. Matches GoalDiscoveryPaceSelection. */
export type GoalDiscoveryPacePayload =
  | { mode: 'generated'; selected_pace: GoalOptionPace }
  | { mode: 'ideal_deadline'; target_date: string }
  | {
      mode: 'weekly_limit';
      preset: GoalDiscoveryWeeklyPreset;
      custom_description?: string;
    };

export interface GoalDiscoveryRoadmapPayload {
  schema_version: number;
  discovery_job_id: string;
  selected_option_id: string;
  answers: GoalDiscoveryAnswersPayload;
  selected_goal: string;
  completion_definition: string;
  why_now: string;
  pace: GoalDiscoveryPacePayload;
  baseline: string;
  constraints: GoalDiscoveryConstraint[];
  constraint_details?: string;
  additional_context?: string;
  idempotency_key: string;
}

// ─── API responses ───────────────────────────────────────────────────────────

export type GoalDiscoveryJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface GoalOptionsJobResponse {
  status: GoalDiscoveryJobStatus;
  job_id: string;
  message: string;
  ws_url: string;
}

/**
 * Stage 2 returns the same shape as /agent/generate-async, which is what lets
 * the existing roadmap pending/result experience consume it unchanged.
 */
export interface GoalDiscoveryRoadmapJobResponse {
  status: GoalDiscoveryJobStatus;
  job_id: string;
  roadmap_id: string;
  message: string;
  ws_url: string;
}

/** Shape of GET /jobs/:jobid/status for a goal-options job. */
export interface GoalOptionsJobStatusResponse {
  job_id: string;
  status: GoalDiscoveryJobStatus;
  progress: number;
  created_at: string;
  result?: GoalOptionsResult;
  error?: string;
  completed_at?: string;
  failed_at?: string;
}

/** Field-keyed validation errors. Key order defines focus order on submit. */
export type GoalDiscoveryErrors = Record<string, string>;
