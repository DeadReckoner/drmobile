import { roadmapApi } from '@/store/apis/roadmapApi';

export const {
  useGetRoadmapsQuery,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,
} = roadmapApi;
