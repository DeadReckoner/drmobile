import { api } from '@/store/apis/api';
import {
  CompleteHabitRequestType,
  CompleteHabitResponseType,
  CreateHabitRequestType,
  CreateHabitResponseType,
  GetHabitCompletionsResponseType,
  GetHabitStatsResponseType,
  GetHabitsForDateResponseType,
  GetHabitsForRangeQueryParamsType,
  GetHabitsForRangeResponseType,
  GetHabitsQueryParamsType,
  GetHabitsResponseType,
  GetTodayHabitsResponseType,
  HabitType,
  UncompleteHabitRequestType,
  UpdateHabitRequestType,
  UpdateHabitResponseType,
} from '@/store/apis/types/habitsApi.types';

export const habitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new habit
    createHabit: builder.mutation<
      CreateHabitResponseType,
      CreateHabitRequestType
    >({
      query: (body) => ({
        url: '/habits',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Habits'],
    }),

    // Get all habits for current user
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

    // Get today's habits with completion status
    getTodayHabits: builder.query<GetTodayHabitsResponseType, void>({
      query: () => '/habits/today',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ habit_id }) => ({
                type: 'Habits' as const,
                id: `TODAY-${habit_id}`,
              })),
              { type: 'Habits', id: 'TODAY' },
            ]
          : [{ type: 'Habits', id: 'TODAY' }],
    }),

    // Get habits for a specific date
    getHabitsForDate: builder.query<GetHabitsForDateResponseType, string>({
      query: (date) => `/habits/date/${date}`,
      providesTags: (_result, _error, date) => [
        { type: 'Habits', id: `DATE-${date}` },
      ],
    }),

    // Get habits for a date range (calendar view)
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

    // Get specific habit
    getHabit: builder.query<HabitType, string>({
      query: (habitId) => `/habits/${habitId}`,
      providesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: habitId },
      ],
    }),

    // Update habit
    updateHabit: builder.mutation<
      UpdateHabitResponseType,
      UpdateHabitRequestType
    >({
      query: ({ habit_id, ...body }) => ({
        url: `/habits/${habit_id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { habit_id }) => [
        { type: 'Habits', id: habit_id },
        { type: 'Habits', id: 'LIST' },
        { type: 'Habits', id: 'TODAY' },
      ],
    }),

    // Delete habit
    deleteHabit: builder.mutation<void, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: habitId },
        { type: 'Habits', id: 'LIST' },
        { type: 'Habits', id: 'TODAY' },
      ],
    }),

    // Archive habit
    archiveHabit: builder.mutation<HabitType, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: habitId },
        { type: 'Habits', id: 'LIST' },
        { type: 'Habits', id: 'TODAY' },
      ],
    }),

    // Complete habit for a date
    completeHabit: builder.mutation<
      CompleteHabitResponseType,
      CompleteHabitRequestType
    >({
      query: ({ habit_id, date, count }) => ({
        url: `/habits/${habit_id}/complete`,
        method: 'POST',
        body: date || count ? { date, count } : undefined,
      }),
      invalidatesTags: (_result, _error, { habit_id, date }) => {
        const tags: (
          | { type: 'Habits'; id: string }
          | { type: 'Habits'; id: 'TODAY' }
        )[] = [
          { type: 'Habits', id: habit_id },
          { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
          { type: 'Habits', id: `STATS-${habit_id}` },
          { type: 'Habits', id: 'TODAY' },
        ];

        if (date) {
          tags.push({ type: 'Habits', id: `DATE-${date}` });
        }

        return tags;
      },
    }),

    // Uncomplete habit (remove completion)
    uncompleteHabit: builder.mutation<void, UncompleteHabitRequestType>({
      query: ({ habit_id, date }) => ({
        url: `/habits/${habit_id}/complete`,
        method: 'DELETE',
        body: date ? { date } : undefined,
      }),
      invalidatesTags: (_result, _error, { habit_id, date }) => {
        const tags: (
          | { type: 'Habits'; id: string }
          | { type: 'Habits'; id: 'TODAY' }
        )[] = [
          { type: 'Habits', id: habit_id },
          { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
          { type: 'Habits', id: `STATS-${habit_id}` },
          { type: 'Habits', id: 'TODAY' },
        ];

        if (date) {
          tags.push({ type: 'Habits', id: `DATE-${date}` });
        }

        return tags;
      },
    }),

    // Get completion history for habit
    getHabitCompletions: builder.query<GetHabitCompletionsResponseType, string>(
      {
        query: (habitId) => `/habits/${habitId}/completions`,
        providesTags: (_result, _error, habitId) => [
          { type: 'Habits', id: `COMPLETIONS-${habitId}` },
        ],
      },
    ),

    // Get habit statistics
    getHabitStats: builder.query<GetHabitStatsResponseType, string>({
      query: (habitId) => `/habits/${habitId}/stats`,
      providesTags: (_result, _error, habitId) => [
        { type: 'Habits', id: `STATS-${habitId}` },
      ],
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
} = habitsApi;
