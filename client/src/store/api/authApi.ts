import { baseApiSlice } from "./baseApi";
import type { DataSubmission } from '../../lib/supabase';

export const authApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (creds) => ({ url: '/auth/login', method: 'POST', body: creds }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken) {
            dispatch({ type: 'auth/setAccessToken', payload: data.accessToken });
          }
        } catch {
          // noop
        }
      },
    }),
    register: builder.mutation<any, { email: string; password: string }>({
      query: (creds) => ({ url: '/auth/register', method: 'POST', body: creds }),
    }),
    refresh: builder.mutation<any, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken) {
            dispatch({ type: 'auth/setAccessToken', payload: data.accessToken });
          }
        } catch {
          dispatch({ type: 'auth/clearAuth' });
        }
      },
    }),
    getMe: builder.query<any, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Auth'],
    }),
    logout: builder.mutation<any, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_args, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch {
          // ignore
        } finally {
          dispatch({ type: 'auth/clearAuth' });
        }
      },
    }),
    // Data submissions
    getSubmissions: builder.query<DataSubmission[], void>({
      query: () => ({ url: '/submissions', method: 'GET' }),
      providesTags: ['DataSubmissions'],
    }),
    uploadFile: builder.mutation<
      any, // ✅ Response type
      FormData              // ✅ Request body type
    >({
      query: (formData) => ({
        url: "auth/process-file",
        method: "POST",
        body: formData,
      }),
    }),
    createSubmission: builder.mutation<DataSubmission, Partial<DataSubmission>>({
      query: (submission) => ({ url: 'auth/process-file', method: 'POST', body: submission }),
      invalidatesTags: ['DataSubmissions'],
    }),
    deleteSubmission: builder.mutation<void, string>({
      query: (id) => ({ url: `/submissions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DataSubmissions'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation, useGetSubmissionsQuery, useUploadFileMutation, useCreateSubmissionMutation, useDeleteSubmissionMutation } = authApiSlice;
export default authApiSlice;


