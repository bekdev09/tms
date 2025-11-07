import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setAccessToken, clearAuth } from "../../features/auth/authSlice";

// ✅ Load API base URL from environment or fallback
const API_BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api/v1";

// ✅ Create baseQuery with token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: "include", // send cookies (for refresh token)
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any)?.auth?.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// ✅ Wrap baseQuery to handle automatic token refresh
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  // First attempt
  let result = await baseQuery(args, api, extraOptions);

  // If we got 401 Unauthorized → try refreshing the token
  if (result?.error && (result.error as any).status === 401) {
    console.warn("baseQueryWithReauth: Access token expired, attempting refresh...");

    // Attempt refresh
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // ✅ Store the new access token
      api.dispatch(setAccessToken({ ...(refreshResult.data as any) }));

      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // ❌ Refresh failed → log out
      console.warn("baseQueryWithReauth: Refresh failed, logging out user.");
      api.dispatch(clearAuth());
    }
  }

  return result;
};

// ✅ Define base API slice for modular endpoints
export const baseApiSlice = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Data"],
  endpoints: () => ({}), // extended in feature slices
});

export default baseApiSlice;
