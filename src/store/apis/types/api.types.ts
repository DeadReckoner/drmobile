import { fetchBaseQuery } from '@reduxjs/toolkit/query';

export type BaseQueryFunctionType = ReturnType<typeof fetchBaseQuery>;

export type ApiError = {
  message: string;
} & {
  data?: {
    error?: string;
  };
};
