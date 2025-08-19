import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api, TagTypes } from '@/store/apis/api';
import { resetDraftAction } from '@/store/slices/roadmapDraftSlice';

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps',
      providesTags: [TagTypes.Roadmaps],
    }),
    updateRoadmap: builder.mutation<
      RoadmapType,
      Partial<RoadmapType> & { roadmap_id: string }
    >({
      query: ({ roadmap_id, ...body }) => {
        return {
          url: `/roadmap/${roadmap_id}`,
          method: 'PATCH',
          body,
        };
      },
    }),
    deleteRoadmap: builder.mutation<{ roadmap_id: string }, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmap/${roadmap_id}`,
          method: 'DELETE',
        };
      },
      async onQueryStarted(roadmap_id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            roadmapApi.util.updateQueryData(
              'getRoadmaps',
              undefined,
              (draft) => {
                const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
                if (idx !== -1) draft.splice(idx, 1);
              },
            ),
          );
          dispatch(resetDraftAction());
        } catch {}
      },
    }),
  }),
  overrideExisting: true,
});
