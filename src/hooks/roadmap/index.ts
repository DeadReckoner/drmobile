import { aiRoadmapApi } from '@/store/apis/aiRoadmapApi';
import { roadmapApi } from '@/store/apis/roadmapApi';

export const {
  useGetRoadmapsQuery,
  useCreateRoadmapMutation,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,
} = roadmapApi;

export const { useCreateAIRoadmapMutation } = aiRoadmapApi;
