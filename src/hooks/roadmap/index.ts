import { roadmapApi } from '@/store/apis/roadmapApi';

export const {
  useGetRoadmapsQuery,
  useCreateRoadmapMutation,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,
} = roadmapApi;
