import { milestoneApi } from '@/store/apis/milestoneApi';

export const {
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useGenerateMilestoneTasksMutation,
} = milestoneApi;
