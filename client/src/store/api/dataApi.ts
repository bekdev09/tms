import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DataSubmission } from '../../lib/supabase';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    try {
      const state: any = getState();
      const token = state?.auth?.accessToken ?? null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch { }
    return headers;
  },
});

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery,
  tagTypes: ['DataSubmissions'],
  endpoints: (builder) => ({
    getSubmissions: builder.query<DataSubmission[], void>({
      query: () => ({ url: '/submissions', method: 'GET' }),
      providesTags: ['DataSubmissions'],
    }),
    createSubmission: builder.mutation<DataSubmission, Partial<DataSubmission>>({
      query: (submission) => ({ url: '/submissions', method: 'POST', body: submission }),
      invalidatesTags: ['DataSubmissions'],
    }),
    deleteSubmission: builder.mutation<void, string>({
      query: (id) => ({ url: `/submissions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DataSubmissions'],
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useCreateSubmissionMutation,
  useDeleteSubmissionMutation,
} = dataApi;
