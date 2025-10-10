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

export const baseApiSlice = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'DataSubmissions'],
  endpoints: () => ({
    // defined in other files
  }),
});

export default baseApiSlice;
