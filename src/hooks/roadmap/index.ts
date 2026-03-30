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
} = roadmapApi;

export const { useCreateAIRoadmapMutation, useGetJobStatusQuery } =
  aiRoadmapApi;

export const {
  useCreateAnchorRequestMutation,
  useGetMyAnchorRequestsQuery,
  useAcceptAnchorRequestMutation,
  useRejectAnchorRequestMutation,
  useRemoveAnchorMutation,
  useCreateHabitAnchorRequestMutation,
  useRemoveHabitAnchorMutation,
} = anchorApi;
