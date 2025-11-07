// src/features/auth/PersistLogin.tsx
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
// import { selectCurrentToken } from "./authSlice";
import { useRefreshMutation } from "./authApi"; // should call POST /auth/refresh
// import usePersist from "../../hooks/usePersist";

interface Props {
  children: React.ReactNode;
}
export default function PersistLogin({ children }: Props): JSX.Element {
  // const token = useAppSelector(selectCurrentToken);
  const token = useAppSelector((s) => s.auth.accessToken);
  // const [persist] = usePersist();
  const persist: boolean = true;
  const location = useLocation();

  const [refresh, { isLoading, isError, error, isSuccess }] =
    useRefreshMutation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let ignore = false;

    const verify = async () => {
      try {
        // if we have no token but persistence is on, try refresh once
        if (!token && persist && location.pathname !== "/login") {
          await refresh().unwrap();
        }
      } catch (err) {
        console.warn("PersistLogin: refresh failed", err);
      } finally {
        if (!ignore) setChecked(true);
      }
    };

    verify();
    return () => {
      ignore = true;
    };
  }, [token, persist, refresh, location.pathname]);

  // 🌀 While checking refresh or token
  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ⚠️ Refresh failed
  if (isError) {
    const msg =
      (error as any)?.data?.message ||
      "Session expired or authentication failed.";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-lg font-semibold mb-2">
            Authentication Error ⚠️
          </h2>
          <p className="text-slate-700 mb-4">{msg}</p>
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Please log in again
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Auth ready or refresh succeeded
  // return <Outlet />;
  return <>{children}</>;
}
