import { aiRoadmapApi } from '@/store/apis/aiRoadmapApi';
import { anchorApi } from '@/store/apis/anchorApi';
import { roadmapApi } from '@/store/apis/roadmapApi';

export const {
  useGetRoadmapsQuery,
  useGetRoadmapByIdQuery,

  useCreateRoadmapMutation,
  useUpdateRoadmapMutation,
  useDeleteRoadmapMutation,

  useStartRoadmapMutation,

  useGetAnchorRoadmapsQuery,
  useNudgeRoadmapMutation,
} = roadmapApi;

export const {
  useCreateAIRoadmapMutation,
  useGetJobStatusQuery,
  useGenerateNextMilestoneMutation,
} = aiRoadmapApi;

export const {
  useCreateAnchorRequestMutation,
  useGetMyAnchorRequestsQuery,
  useAcceptAnchorRequestMutation,
  useRejectAnchorRequestMutation,
  useRemoveAnchorMutation,
  useCreateHabitAnchorRequestMutation,
  useRemoveHabitAnchorMutation,
} = anchorApi;
