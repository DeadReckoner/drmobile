// Habit Types based on backend implementation

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export type HabitType = {
  habit_id: string;
  user_id: string;
  title: string;
  description?: string;
  recurrence_type: RecurrenceType;
  days_of_week?: number; // Bitmask for weekly habits (1=Sun, 2=Mon, ..., 64=Sat)
  day_of_month?: number; // Day of month for monthly habits (1-31)
  due_date?: string; // For one-time todos (recurrence_type: 'none')
  start_date: string;
  end_date?: string;
  archived?: boolean;
  created_at: string;
  updated_at: string;
  anchor_id?: string;
  // Step definitions on the template. Omitted by the server when the item has
  // none, so this stays undefined for every pre-existing habit.
  steps?: HabitStepType[];
};

export type CreateHabitRequestType = {
  title: string;
  description?: string;
  recurrence_type: RecurrenceType;
  days_of_week?: number; // Required for weekly habits
  day_of_month?: number; // Required for monthly habits
  due_date?: string; // Required for one-time todos
  start_date: string;
  end_date?: string;
};

export type CreateHabitResponseType = HabitType;

export type UpdateHabitRequestType = {
  habit_id: string;
  title?: string;
  description?: string;
  recurrence_type?: RecurrenceType;
  days_of_week?: number;
  day_of_month?: number;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  archived?: boolean;
};

export type UpdateHabitResponseType = HabitType;

export type GetHabitsQueryParamsType = {
  include_archived?: boolean;
};

export type GetHabitsResponseType = HabitType[];

export type HabitCompletionType = {
  completion_id: string;
  habit_id: string;
  completed_date: string;
  count: number;
  created_at: string;
};

// --- Multi-step recurring habits/tasks ---------------------------------------
//
// A habit is a TEMPLATE; each date it is due is an OCCURRENCE. Step
// DEFINITIONS live on the template (HabitStepType); step STATE belongs to one
// occurrence (HabitOccurrenceStepType). That mirrors the server model and is
// why checking a step is a different call from renaming one.

export type StepStatusType = 'incomplete' | 'completed' | 'skipped';

export type HabitStepType = {
  habit_step_id: string;
  habit_id: string;
  description: string;
  number: number;
  created_at?: string;
  updated_at?: string;
};

export type HabitOccurrenceStepType = {
  habit_step_id: string;
  description: string;
  number: number;
  status: StepStatusType;
  completed: boolean;
  completed_at?: string;
};

export type HabitOccurrenceStepsType = {
  habit_id: string;
  date: string;
  steps: HabitOccurrenceStepType[];
  steps_total: number;
  steps_completed: number;
  is_completed: boolean;
};

export type CreateHabitStepRequestType = {
  habit_id: string;
  description: string;
  number?: number;
};

export type UpdateHabitStepRequestType = {
  habit_id: string;
  habit_step_id: string;
  description?: string;
  number?: number;
};

export type DeleteHabitStepRequestType = {
  habit_id: string;
  habit_step_id: string;
};

export type ReorderHabitStepsRequestType = {
  habit_id: string;
  step_ids: string[];
};

export type GetHabitOccurrenceStepsRequestType = {
  habit_id: string;
  date?: string;
};

export type SetHabitStepStateRequestType = {
  habit_id: string;
  habit_step_id: string;
  date?: string;
  status?: StepStatusType;
  completed?: boolean;
};

export type HabitWithStatusType = HabitType & {
  is_completed?: boolean;
  completion_status?: {
    count: number;
    completion_id?: string;
  };
  // Step progress for the occurrence this status was computed for. Absent or 0
  // for items without steps, which is every habit created before multi-step
  // support -- so list rendering degrades cleanly.
  steps_total?: number;
  steps_completed?: number;
  occurrence_steps?: HabitOccurrenceStepType[];
};

export type GetTodayHabitsResponseType = HabitWithStatusType[];

export type GetHabitsForDateResponseType = HabitWithStatusType[];

export type GetHabitsForRangeQueryParamsType = {
  start: string;
  end: string;
};

export type GetHabitsForRangeResponseType = HabitWithStatusType[];

export type CompleteHabitRequestType = {
  habit_id: string;
  date?: string;
  count?: number;
};

export type CompleteHabitResponseType = HabitCompletionType;

export type UncompleteHabitRequestType = {
  habit_id: string;
  date?: string;
};

export type GetHabitCompletionsResponseType = HabitCompletionType[];

export type HabitStatsType = {
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completion_rate: number;
  last_completed_date?: string;
};

export type GetHabitStatsResponseType = HabitStatsType;
