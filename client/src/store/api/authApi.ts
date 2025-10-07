import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    try {
      const state: any = getState();
      const token = state?.auth?.accessToken ?? null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // noop
    }
    return headers;
  },
  credentials: 'include', // ensure refresh cookie is sent
});

const baseQueryWithReauth: BaseQueryFn<string | any, unknown, unknown> = async (args, api, extraOptions) => {
  // first try
  let result = await rawBaseQuery(args, api, extraOptions);

  // if we get 401, try refresh and then retry original
  // @ts-ignore - result.error may be typed differently
  if (result.error && (result.error as any).status === 401) {
    try {
      const refreshResult = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
      if (refreshResult.data && (refreshResult.data as any).accessToken) {
        const newAccess = (refreshResult.data as any).accessToken;
        try {
          // update redux in-memory token
          api.dispatch({ type: 'auth/setAccessToken', payload: newAccess });
        } catch { }
        // retry original
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        try {
          api.dispatch({ type: 'auth/setAccessToken', payload: null });
        } catch { }
      }
    } catch (e) {
      try {
        api.dispatch({ type: 'auth/setAccessToken', payload: null });
      } catch { }
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
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
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useGetMeQuery, useLogoutMutation } = authApi;

export default authApi;
