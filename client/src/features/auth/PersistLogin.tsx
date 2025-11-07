import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  useLazyGetMeQuery,
  useRefreshMutation,
} from "./authApi";
import {
  setAccessToken,
  setUser,
  clearAuth,
  setLoading,
} from "./authSlice";

export default function PersistLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [ready, setReady] = useState(false);

  const [refresh, { isError: isRefreshError, error: refreshError, isLoading }] =
    useRefreshMutation();
  const [getMe, { isError: isGetMeError, error: getMeError }] =
    useLazyGetMeQuery();

  useEffect(() => {
    let ignore = false;

    const initAuth = async () => {
      try {
        // ✅ Already have token — just fetch user
        if (accessToken) {
          const res = await getMe().unwrap();
          if (res?.user) dispatch(setUser(res.user));
          return;
        }

        // ✅ Otherwise, try silent refresh using cookie
        const refreshed = await refresh().unwrap();
        if (refreshed?.accessToken) {
          dispatch(setAccessToken(refreshed.accessToken));

          // Fetch /auth/me with new token
          const meRes = await getMe().unwrap();
          if (meRes?.user) dispatch(setUser(meRes.user));
          else dispatch(clearAuth());
        } else {
          dispatch(clearAuth());
        }
      } catch (err) {
        console.warn("PersistLogin initAuth failed", err);
        dispatch(clearAuth());
      } finally {
        if (!ignore) {
          dispatch(setLoading(false));
          setReady(true);
        }
      }
    };

    initAuth();
    return () => {
      ignore = true;
    };
  }, [accessToken, dispatch, refresh, getMe]);

  // --- UI STATES ---

  // 🌀 While checking authentication
  if (isLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ⚠️ Handle RTK Query error states (no local state needed)
  if (isRefreshError || isGetMeError) {
    const errorMsg =
      (refreshError as any)?.data?.message ||
      (getMeError as any)?.data?.message ||
      "Authentication failed or session expired.";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-lg font-semibold mb-2">Authentication Error ⚠️</h2>
          <p className="text-slate-700 mb-4">{errorMsg}</p>
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Please log in again
          </a>
        </div>
      </div>
    );
  }

  // ✅ Auth success or valid token
  return <>{children}</>;
}
