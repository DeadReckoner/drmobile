import {
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
  }),
  overrideExisting: false,
});
