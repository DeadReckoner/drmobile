import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps',
    }),
  }),
  overrideExisting: true,
});
