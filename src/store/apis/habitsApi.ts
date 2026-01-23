import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
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
import { DateUtils } from '@/utils/date.utils';
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
      habitsApi.endpoints.getTodayHabits.initiate(
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        {
          forceRefetch: true,
        },
      ),
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
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
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
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
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
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
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
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
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
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
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
        { type: 'Habits', id: `COMPLETIONS-${habit_id}` },
        { type: 'Habits', id: `STATS-${habit_id}` },
        ...(date ? [{ type: 'Habits' as const, id: `DATE-${date}` }] : []),
      ]),
    );
  } catch {}
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

    getTodayHabits: builder.query<GetTodayHabitsResponseType, string>({
      query: (date) => '/habits/today?date=' + date,
      providesTags: (result, _error, _arg) => {
        const today = DateUtils.formatDate(
          DateUtils.createDate(),
          'YYYY-MM-DD',
        );
        return result
          ? [
              ...result.map(({ habit_id }) => ({
                type: 'Habits' as const,
                id: `TODAY-${today}-${habit_id}`,
              })),
              { type: 'Habits', id: `TODAY-${today}` },
            ]
          : [{ type: 'Habits', id: `TODAY-${today}` }];
      },
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
