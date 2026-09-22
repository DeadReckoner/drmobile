import {
  GenerateNextMilestoneRequest,
  ImportPlanContextType,
  NextMilestoneJobResponse,
  RoadmapCreationJobResponse,
  RoadmapCreationJobStatusResponse,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';

export const aiRoadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAIRoadmap: builder.mutation<
      RoadmapCreationJobResponse,
      Partial<RoadmapType>
    >({
      query: (roadmap) => {
        return {
          url: `/agent/generate-async`,
          method: 'POST',
          body: roadmap,
        };
      },
    }),
    getJobStatus: builder.query<
      RoadmapCreationJobStatusResponse,
      { jobId: string }
    >({
      query: ({ jobId }) => {
        return {
          url: `/jobs/${jobId}/status`,
          method: 'GET',
        };
      },
    }),
    generateNextMilestone: builder.mutation<
      NextMilestoneJobResponse,
      { milestoneId: string; body: GenerateNextMilestoneRequest }
    >({
      query: ({ milestoneId, body }) => ({
        url: `/agent/generate-next-milestone-async/${milestoneId}`,
        method: 'POST',
        body,
      }),
    }),
    importPlan: builder.mutation<
      RoadmapCreationJobResponse,
      {
        fileUri: string;
        fileName: string;
        mimeType: string;
        context?: ImportPlanContextType;
      }
    >({
      queryFn: async (args, _api, _extraOptions, baseQuery) => {
        const formData = new FormData();
        formData.append('file', {
          uri: args.fileUri,
          name: args.fileName,
          type: args.mimeType || 'application/pdf',
        } as unknown as Blob);

        if (args.context && Object.keys(args.context).length > 0) {
          formData.append('context', JSON.stringify(args.context));
        }

        const result = await baseQuery({
          url: '/agent/import-plan',
          method: 'POST',
          body: formData,
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as RoadmapCreationJobResponse };
      },
    }),
  }),
  overrideExisting: false,
});
