import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';

export const aiRoadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAIRoadmap: builder.mutation<RoadmapType, Partial<RoadmapType>>({
      query: (roadmap) => {
        return {
          url: `/agent/generate`,
          method: 'POST',
          body: roadmap,
        };
      },
    }),
  }),
  overrideExisting: false,
});
