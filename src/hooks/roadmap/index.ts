import { aiRoadmapApi } from '@/store/apis/aiRoadmapApi';
import { roadmapApi } from '@/store/apis/roadmapApi';

export const {
  useGetRoadmapsQuery,
  useGetRoadmapByIdQuery,

  useCreateRoadmapMutation,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,

  useStartRoadmapMutation,
} = roadmapApi;

export const { useCreateAIRoadmapMutation, useGetJobStatusQuery } =
  aiRoadmapApi;
