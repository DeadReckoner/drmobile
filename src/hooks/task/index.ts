import { taskApi } from '@/store/apis/taskApi';

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  useGetUserTasksByStartDateQuery,
  useGetTasksByRangeQuery,
  useGetTasksByIdQuery,
} = taskApi;
