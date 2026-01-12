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
    createHabit: builder.mutation<
      CreateHabitResponseType,
      CreateHabitRequestType
    >({
      query: (body) => ({
        url: '/habits',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
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
        } catch {}
      },
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
      onQueryStarted: async ({ habit_id }, { dispatch, queryFulfilled }) => {
        try {
          const { data: updatedHabit } = await queryFulfilled;

          // Update getHabits cache
          dispatch(
            habitsApi.util.updateQueryData(
              'getHabits',
              { include_archived: false },
              (draft: GetHabitsResponseType) => {
                const index = draft.findIndex(
                  (habit) => habit.habit_id === habit_id,
                );
                if (index !== -1) {
                  draft[index] = updatedHabit;
                }
              },
            ),
          );

          // Update getHabit cache
          dispatch(
            habitsApi.util.updateQueryData(
              'getHabit',
              habit_id,
              () => updatedHabit,
            ),
          );
        } catch {}
      },
    }),

    deleteHabit: builder.mutation<void, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}`,
        method: 'DELETE',
      }),
      onQueryStarted: async (habitId, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            habitsApi.util.updateQueryData(
              'getHabits',
              { include_archived: false },
              (draft: GetHabitsResponseType) => {
                const index = draft.findIndex(
                  (habit) => habit.habit_id === habitId,
                );
                if (index !== -1) {
                  draft.splice(index, 1);
                }
              },
            ),
          );
        } catch {}
      },
    }),

    archiveHabit: builder.mutation<HabitType, string>({
      query: (habitId) => ({
        url: `/habits/${habitId}/archive`,
        method: 'POST',
      }),
      onQueryStarted: async (habitId, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            habitsApi.util.updateQueryData(
              'getHabits',
              { include_archived: false },
              (draft: GetHabitsResponseType) => {
                const index = draft.findIndex(
                  (habit) => habit.habit_id === habitId,
                );
                if (index !== -1) {
                  draft.splice(index, 1);
                }
              },
            ),
          );
        } catch {}
      },
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
      // Invalidate tags as cache update is complex (stats, completions, date-specific queries)
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

    uncompleteHabit: builder.mutation<void, UncompleteHabitRequestType>({
      query: ({ habit_id, date }) => ({
        url: `/habits/${habit_id}/complete`,
        method: 'DELETE',
        body: date ? { date } : undefined,
      }),
      // Invalidate tags as cache update is complex (stats, completions, date-specific queries)
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
