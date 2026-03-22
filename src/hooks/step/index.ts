import { stepApi } from '@/store/apis/stepApi';

export const {
  useCreateStepMutation,
  useUpdateStepMutation,
  useDeleteStepMutation,
  useCompleteAllStepsMutation,
} = stepApi;
