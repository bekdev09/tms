import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase, DataSubmission } from '../../lib/supabase';

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['DataSubmissions'],
  endpoints: (builder) => ({
    getSubmissions: builder.query<DataSubmission[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('data_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }

        return { data: data || [] };
      },
      providesTags: ['DataSubmissions'],
    }),
    createSubmission: builder.mutation<DataSubmission, Partial<DataSubmission>>({
      queryFn: async (submission) => {
        const { data: userData } = await supabase.auth.getUser();

        if (!userData.user) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Not authenticated' } };
        }

        const { data, error } = await supabase
          .from('data_submissions')
          .insert([{ ...submission, user_id: userData.user.id }])
          .select()
          .single();

        if (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }

        return { data };
      },
      invalidatesTags: ['DataSubmissions'],
    }),
    deleteSubmission: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from('data_submissions')
          .delete()
          .eq('id', id);

        if (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }

        return { data: undefined };
      },
      invalidatesTags: ['DataSubmissions'],
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useCreateSubmissionMutation,
  useDeleteSubmissionMutation,
} = dataApi;
