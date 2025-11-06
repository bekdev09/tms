import { baseApiSlice } from '../../store/api/baseApi';

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
    uploadFile: builder.mutation<
      any,                  // ✅ Response type
      FormData              // ✅ Request body type
    >({
      query: (formData) => ({
        url: "auth/process-file",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation, useUploadFileMutation } = authApiSlice;
export default authApiSlice;
