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
  is_archived: boolean;
  archived?: boolean;
  created_at: string;
  updated_at: string;
  anchor_id?: string;
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
  is_archived?: boolean;
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

export type HabitWithStatusType = HabitType & {
  is_completed?: boolean;
  completion_status?: {
    count: number;
    completion_id?: string;
  };
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
