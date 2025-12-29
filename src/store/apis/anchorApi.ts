import {
  AnchorRequest,
  AnchorRequestResponse,
  MessageResponse,
} from '@/hooks/friends/types/friends.types';
import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequest,
  { roadmapId: string; anchorId: string },
  BaseQueryFunctionType
> = async (_args, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          draft.push(data);
        },
      ),
    );
  } catch {}
};

const onAcceptAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequestResponse,
  string,
  BaseQueryFunctionType
> = async (requestId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          const index = draft.findIndex((req) => req.request_id === requestId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );

    dispatch(api.util.invalidateTags(['Friends', 'Threads']));
  } catch {}
};

const onRejectAnchorRequestStarted: TypedMutationOnQueryStarted<
  AnchorRequestResponse,
  string,
  BaseQueryFunctionType
> = async (requestId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      anchorApi.util.updateQueryData(
        'getMyAnchorRequests',
        undefined,
        (draft) => {
          const index = draft.findIndex((req) => req.request_id === requestId);
          if (index !== -1) {
            draft.splice(index, 1);
          }
        },
      ),
    );
  } catch {}
};

const onRemoveAnchorStarted: TypedMutationOnQueryStarted<
  MessageResponse,
  string,
  BaseQueryFunctionType
> = async (roadmapId, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      api.util.invalidateTags([
        'Roadmaps',
        { type: 'Roadmaps', id: roadmapId },
      ]),
    );
  } catch {}
};

export const anchorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnchorRequest: builder.mutation<
      AnchorRequest,
      { roadmapId: string; anchorId: string }
    >({
      query: ({ roadmapId, anchorId }) => ({
        url: `/roadmaps/${roadmapId}/anchor-request`,
        method: 'POST',
        body: { anchor_id: anchorId },
      }),
      onQueryStarted: onCreateAnchorRequestStarted,
    }),

    getMyAnchorRequests: builder.query<AnchorRequest[], void>({
      query: () => ({
        url: '/anchor-requests',
        method: 'GET',
      }),
      providesTags: ['AnchorRequests'],
      keepUnusedDataFor: 900,
    }),

    acceptAnchorRequest: builder.mutation<AnchorRequestResponse, string>({
      query: (requestId) => ({
        url: `/anchor-requests/${requestId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AnchorRequests', 'Friends', 'Threads'],
      onQueryStarted: onAcceptAnchorRequestStarted,
    }),

    rejectAnchorRequest: builder.mutation<AnchorRequestResponse, string>({
      query: (requestId) => ({
        url: `/anchor-requests/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['AnchorRequests'],
      onQueryStarted: onRejectAnchorRequestStarted,
    }),

    removeAnchor: builder.mutation<MessageResponse, string>({
      query: (roadmapId) => ({
        url: `/roadmaps/${roadmapId}/anchor`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, roadmapId) => [
        'Roadmaps',
        { type: 'Roadmaps', id: roadmapId },
      ],
      onQueryStarted: onRemoveAnchorStarted,
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateAnchorRequestMutation,
  useGetMyAnchorRequestsQuery,
  useAcceptAnchorRequestMutation,
  useRejectAnchorRequestMutation,
  useRemoveAnchorMutation,
} = anchorApi;
