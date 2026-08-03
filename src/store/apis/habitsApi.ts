import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  CompleteHabitRequestType,
  CompleteHabitResponseType,
  CreateHabitRequestType,
  CreateHabitResponseType,
  CreateHabitStepRequestType,
  DeleteHabitStepRequestType,
  GetHabitCompletionsResponseType,
  GetHabitOccurrenceStepsRequestType,
  GetHabitStatsResponseType,
  GetHabitsForDateResponseType,
  GetHabitsForRangeQueryParamsType,
  GetHabitsForRangeResponseType,
  GetHabitsQueryParamsType,
  GetHabitsResponseType,
  GetTodayHabitsResponseType,
  HabitOccurrenceStepsType,
  HabitStepType,
  HabitType,
  ReorderHabitStepsRequestType,
  SetHabitStepStateRequestType,
  StepStatusType,
  UncompleteHabitRequestType,
  UpdateHabitRequestType,
  UpdateHabitResponseType,
  UpdateHabitStepRequestType,
} from '@/store/apis/types/habitsApi.types';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateHabitStarted: TypedMutationOnQueryStarted<
  HabitType,
  HabitType,
  BaseQueryFunctionType
> = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    const { data: createdHabit } = await queryFulfilled;
    dispatch(
      habitsApi.util.updateQueryData(
        'getHabits',
        { include_archived: false },
        (draft: GetHabitsResponseType) => {
          draft.unshift(createdHabit);
        },
      ),
    );
    dispatch(
      habitsApi.endpoints.getTodayHabits.initiate(undefined, {
        forceRefetch: true,
      }),
    );
  } catch {}
};

const onUpdateHabitQueryStarted: TypedMutationOnQueryStarted<
  HabitType,
  HabitType,
  BaseQueryFunctionType
> = async ({ habit_id }, { dispatch, queryFulfilled }) => {
  try {
    const { data: updatedHabit } = await queryFulfilled;
    dispatch(
      habitsApi.util.updateQueryData(
        'getHabits',
        { include_archived: false },
        (draft: GetHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habit_id);
          if (index !== -1) {
            draft[index] = updatedHabit;
          }
        },
      ),
    );

    dispatch(
      habitsApi.util.updateQueryData('getHabit', habit_id, () => updatedHabit),
    );
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habit_id);
          if (index !== -1) {
            draft[index] = updatedHabit;
          }
        },
      ),
    );
  } catch {}
};

const onDeleteHabitQueryStarted: TypedMutationOnQueryStarted<
  void,
  string,
  BaseQueryFunctionType
> = async (habitId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      habitsApi.util.updateQueryData(
        'getHabits',
        { include_archived: false },
        (draft: GetHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habitId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habitId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );
  } catch {}
};

const onArchiveHabitQueryStarted: TypedMutationOnQueryStarted<
  HabitType,
  string,
  BaseQueryFunctionType
> = async (habitId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    let archivedHabit: HabitType | null = null;

    dispatch(
      habitsApi.util.updateQueryData(
        'getHabits',
        { include_archived: false },
        (draft: GetHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habitId);
          if (index !== -1) {
            archivedHabit = { ...draft[index] };
            draft.splice(index, 1);
          }
        },
      ),
    );

    dispatch(
      habitsApi.util.updateQueryData(
        'getHabits',
        { include_archived: true },
        (draft: GetHabitsResponseType) => {
          if (archivedHabit) {
            draft.unshift({ ...archivedHabit, archived: true });
          }
        },
      ),
    );
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const index = draft.findIndex((habit) => habit.habit_id === habitId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );
  } catch {}
};

const onCompleteHabitQueryStarted: TypedMutationOnQueryStarted<
  CompleteHabitResponseType,
  CompleteHabitRequestType,
  BaseQueryFunctionType
> = async ({ habit_id, date }, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const habit = draft.find((h) => h.habit_id === habit_id);
          if (habit) {
            habit.is_completed = true;
          }
        },
      ),
    );

    dispatch(
      habitsApi.util.invalidateTags([
        { type: 'Habits', id: habit_id },
        { type: 'Habits', id: 'LIST' },
        { type: 'Habits', id: 'TODAY' },
        { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
        { type: 'Habits', id: `STATS-${habit_id}` },
        ...(date ? [{ type: 'Habits' as const, id: `DATE-${date}` }] : []),
      ]),
    );
  } catch {}
};

const onUncompleteHabitQueryStarted: TypedMutationOnQueryStarted<
  void,
  UncompleteHabitRequestType,
  BaseQueryFunctionType
> = async ({ habit_id, date }, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const habit = draft.find((h) => h.habit_id === habit_id);
          if (habit) {
            habit.is_completed = false;
          }
        },
      ),
    );
    dispatch(
      habitsApi.util.invalidateTags([
        { type: 'Habits', id: habit_id },
        { type: 'Habits', id: 'LIST' },
        { type: 'Habits', id: 'TODAY' },
        { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
        { type: 'Habits', id: `STATS-${habit_id}` },
        ...(date ? [{ type: 'Habits' as const, id: `DATE-${date}` }] : []),
      ]),
    );
  } catch {}
};

// Editing step definitions changes what every not-yet-started occurrence looks
// like, so the lists and the active occurrence all have to re-read.
const habitStepTags = (habitId: string) =>
  [
    { type: 'Habits' as const, id: habitId },
    { type: 'Habits' as const, id: `STEPS-${habitId}` },
    { type: 'Habits' as const, id: 'LIST' },
    { type: 'Habits' as const, id: 'TODAY' },
  ] as const;

// Toggling a step is the highest-frequency interaction in the feature, so it
// updates optimistically: the checkbox moves immediately and the parent's
// completed state is derived locally with the same rule the server applies
// (an occurrence is done when nothing is left "incomplete" -- skipped counts).
// The server response then replaces the guess, so any disagreement (another
// device, a template edit mid-flight) self-corrects rather than sticking.
const onSetHabitStepStateQueryStarted: TypedMutationOnQueryStarted<
  HabitOccurrenceStepsType,
  SetHabitStepStateRequestType,
  BaseQueryFunctionType
> = async (arg, { dispatch, queryFulfilled }) => {
  const { habit_id, habit_step_id, date, status, completed } = arg;
  const nextStatus: StepStatusType =
    status ?? (completed ? 'completed' : 'incomplete');

  const patch = dispatch(
    habitsApi.util.updateQueryData(
      'getHabitOccurrenceSteps',
      { habit_id, date },
      (draft) => {
        const step = draft.steps.find((s) => s.habit_step_id === habit_step_id);
        if (!step) return;
        step.status = nextStatus;
        step.completed = nextStatus === 'completed';
        draft.steps_completed = draft.steps.filter(
          (s) => s.status !== 'incomplete',
        ).length;
        draft.is_completed =
          draft.steps.length > 0 &&
          draft.steps_completed === draft.steps.length;
      },
    ),
  );

  try {
    const { data } = await queryFulfilled;
    // Reconcile the today list so the row's progress badge and completed state
    // match without a full refetch.
    dispatch(
      habitsApi.util.updateQueryData(
        'getTodayHabits',
        undefined,
        (draft: GetTodayHabitsResponseType) => {
          const habit = draft.find((h) => h.habit_id === habit_id);
          if (!habit) return;
          habit.steps_total = data.steps_total;
          habit.steps_completed = data.steps_completed;
          habit.is_completed = data.is_completed;
        },
      ),
    );
    // Completion changed, so streaks/history/day views are stale.
    dispatch(
      habitsApi.util.invalidateTags([
        { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
        { type: 'Habits', id: `STATS-${habit_id}` },
        ...(date ? [{ type: 'Habits' as const, id: `DATE-${date}` }] : []),
      ]),
    );
  } catch {
    patch.undo();
  }
};

export const habitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createHabit: builder.mutation<
      CreateHabitResponseType,
      CreateHabitRequestType
    >({
      query: (body) => ({
        url: '/habits',
        method: 'POST',
        body,
      }),
      onQueryStarted: onCreateHabitStarted,
    }),

    getHabits: builder.query<GetHabitsResponseType, GetHabitsQueryParamsType>({
      query: (params) => ({
        url: '/habits',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ habit_id }) => ({
                type: 'Habits' as const,
                id: habit_id,
              })),
              { type: 'Habits', id: 'LIST' },
            ]
          : [{ type: 'Habits', id: 'LIST' }],
    }),

    getTodayHabits: builder.query<GetTodayHabitsResponseType, void>({
      query: () => '/habits/today',
      providesTags: [{ type: 'Habits', id: 'TODAY' }],
    }),

    getHabitsForDate: builder.query<GetHabitsForDateResponseType, string>({
      query: (date) => `/habits/date/${date}`,
      providesTags: (_result, _error, date) => [
        { type: 'Habits', id: `DATE-${date}` },
      ],
    }),

    getHabitsForRange: builder.query<
      GetHabitsForRangeResponseType,
      GetHabitsForRangeQueryParamsType
    >({
      query: (params) => ({
        url: '/habits/range',
        params,
      }),
      providesTags: (_result, _error, { start, end }) => [
        { type: 'Habits', id: `RANGE-${start}-${end}` },
      ],
    }),

    getHabit: builder.query<HabitType, string>({
      query: (habitId) => `/habits/${habitId}`,
      providesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: habitId },
      ],
    }),

    updateHabit: builder.mutation<
      UpdateHabitResponseType,
      UpdateHabitRequestType
    >({
      query: ({ habit_id, ...body }) => ({
        url: `/habits/${habit_id}`,
        method: 'PATCH',
        body,
      }),
      onQueryStarted: onUpdateHabitQueryStarted,
    }),

    deleteHabit: builder.mutation<void, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}`,
        method: 'DELETE',
      }),
      onQueryStarted: onDeleteHabitQueryStarted,
    }),

    archiveHabit: builder.mutation<HabitType, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}/archive`,
        method: 'POST',
      }),
      onQueryStarted: onArchiveHabitQueryStarted,
    }),

    completeHabit: builder.mutation<
      CompleteHabitResponseType,
      CompleteHabitRequestType
    >({
      query: ({ habit_id, date, count }) => ({
        url: `/habits/${habit_id}/complete`,
        method: 'POST',
        body: date || count ? { date, count } : undefined,
      }),
      onQueryStarted: onCompleteHabitQueryStarted,
    }),

    uncompleteHabit: builder.mutation<void, UncompleteHabitRequestType>({
      query: ({ habit_id, date }) => ({
        url: `/habits/${habit_id}/complete`,
        method: 'DELETE',
        body: date ? { date } : undefined,
      }),
      onQueryStarted: onUncompleteHabitQueryStarted,
    }),

    getHabitCompletions: builder.query<GetHabitCompletionsResponseType, string>(
      {
        query: (habitId) => `/habits/${habitId}/completions`,
        providesTags: (_result, _error, habitId) => [
          { type: 'Habits', id: `COMPLETIONS-${habitId}` },
        ],
      },
    ),

    getHabitStats: builder.query<GetHabitStatsResponseType, string>({
      query: (habitId) => `/habits/${habitId}/stats`,
      providesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: `STATS-${habitId}` },
      ],
    }),

    // --- Step DEFINITIONS on the recurring template -------------------------

    getHabitSteps: builder.query<HabitStepType[], string>({
      query: (habitId) => `/habits/${habitId}/steps`,
      providesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: `STEPS-${habitId}` },
      ],
    }),

    createHabitStep: builder.mutation<
      HabitStepType,
      CreateHabitStepRequestType
    >({
      query: ({ habit_id, ...body }) => ({
        url: `/habits/${habit_id}/steps`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { habit_id }) => habitStepTags(habit_id),
    }),

    updateHabitStep: builder.mutation<
      HabitStepType,
      UpdateHabitStepRequestType
    >({
      query: ({ habit_id, habit_step_id, ...body }) => ({
        url: `/habits/${habit_id}/steps/${habit_step_id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { habit_id }) => habitStepTags(habit_id),
    }),

    deleteHabitStep: builder.mutation<void, DeleteHabitStepRequestType>({
      query: ({ habit_id, habit_step_id }) => ({
        url: `/habits/${habit_id}/steps/${habit_step_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { habit_id }) => habitStepTags(habit_id),
    }),

    reorderHabitSteps: builder.mutation<
      HabitStepType[],
      ReorderHabitStepsRequestType
    >({
      query: ({ habit_id, step_ids }) => ({
        url: `/habits/${habit_id}/steps/reorder`,
        method: 'POST',
        body: { step_ids },
      }),
      invalidatesTags: (_r, _e, { habit_id }) => habitStepTags(habit_id),
    }),

    // --- Step STATE for one dated occurrence --------------------------------

    getHabitOccurrenceSteps: builder.query<
      HabitOccurrenceStepsType,
      GetHabitOccurrenceStepsRequestType
    >({
      query: ({ habit_id, date }) => ({
        url: `/habits/${habit_id}/occurrence/steps`,
        params: date ? { date } : undefined,
      }),
      providesTags: (_result, _error, { habit_id, date }) => [
        { type: 'Habits', id: `OCCURRENCE-${habit_id}-${date ?? 'today'}` },
      ],
    }),

    // The server returns the whole recomputed occurrence, so the parent's
    // completed state and the progress counters arrive with the toggle rather
    // than needing a follow-up read.
    setHabitStepState: builder.mutation<
      HabitOccurrenceStepsType,
      SetHabitStepStateRequestType
    >({
      query: ({ habit_id, habit_step_id, ...body }) => ({
        url: `/habits/${habit_id}/occurrence/steps/${habit_step_id}`,
        method: 'PATCH',
        body,
      }),
      onQueryStarted: onSetHabitStepStateQueryStarted,
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateHabitMutation,
  useGetHabitsQuery,
  useGetTodayHabitsQuery,
  useGetHabitsForDateQuery,
  useGetHabitsForRangeQuery,
  useGetHabitQuery,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useArchiveHabitMutation,
  useCompleteHabitMutation,
  useUncompleteHabitMutation,
  useGetHabitCompletionsQuery,
  useGetHabitStatsQuery,
  useLazyGetHabitsQuery,
  useLazyGetTodayHabitsQuery,
  useLazyGetHabitsForDateQuery,
  useLazyGetHabitsForRangeQuery,
  useLazyGetHabitQuery,
  useLazyGetHabitCompletionsQuery,
  useLazyGetHabitStatsQuery,
  // Multi-step recurring items
  useGetHabitStepsQuery,
  useCreateHabitStepMutation,
  useUpdateHabitStepMutation,
  useDeleteHabitStepMutation,
  useReorderHabitStepsMutation,
  useGetHabitOccurrenceStepsQuery,
  useSetHabitStepStateMutation,
  useLazyGetHabitStepsQuery,
  useLazyGetHabitOccurrenceStepsQuery,
} = habitsApi;
