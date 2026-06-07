import { api } from '@/store/apis/api';
import {
  SubmitReportParamsType,
  SubmitReportResponseType,
} from '@/store/apis/types/reportApi.types';

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitReport: builder.mutation<
      SubmitReportResponseType,
      SubmitReportParamsType
    >({
      query: (report) => ({
        //TODO: update the right url with payload
        url: '/report',
        method: 'POST',
        body: report,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useSubmitReportMutation } = reportApi;
