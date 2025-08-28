import { fetchBaseQuery } from '@reduxjs/toolkit/query';

export type BaseQueryFunctionType = ReturnType<typeof fetchBaseQuery>;

export interface ApiError {
  message: string;
}
