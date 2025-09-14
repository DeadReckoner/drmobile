import { taskApi } from '@/store/apis/taskApi';

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  useGetTasksByUserIdQuery,
  useGetTasksByIdQuery,
} = taskApi;
