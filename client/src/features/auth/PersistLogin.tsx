// src/features/auth/PersistLogin.tsx
import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useRefreshMutation, useLazyGetMeQuery } from "./authApi";
import { setUser, setLoading } from "./authSlice";
import usePersist from "../../hooks/usePersist";

export default function PersistLogin(): JSX.Element {
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const [persist] = usePersist();

  const [refresh, { isLoading, isError, error }] = useRefreshMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [verifying, setVerifying] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let ignore = false;

    const verify = async () => {
      try {
        // console.debug("PersistLogin: start verify", { token, user, persist });

        if (token && user) {
          console.debug("PersistLogin: already authenticated — skipping");
          dispatch(setLoading(false));
          setVerifying(false);
          return;
        }

        // we have token but no user, just fetch user data
        if (token && !user) {
          console.debug(
            "PersistLogin: token exists but no user — fetching /auth/me"
          );
          try {
            const me = await triggerGetMe().unwrap();
            if (me && !ignore) {
              dispatch(setUser(me.user));
            }
          } catch (e) {
            console.warn("PersistLogin: getMe failed", e);
          } finally {
            if (!ignore) {
              dispatch(setLoading(false));
              setVerifying(false);
            }
          }
          return;
        }

        // Only refresh if we have NO token but persistence is on
        if (!token && persist) {
          console.debug("PersistLogin: no token — attempting refresh");
          const res = await refresh().unwrap();

          // If refresh succeeded, fetch user data
          if (res && !ignore) {
            console.debug("PersistLogin: refresh success — fetching user");
            try {
              const me = await triggerGetMe().unwrap();
              if (me) dispatch(setUser(me.user));
            } catch (e) {
              console.warn("PersistLogin: getMe failed after refresh", e);
            }
          }
        }
      } catch (err) {
        console.warn("PersistLogin: verify process failed", err);
      } finally {
        if (!ignore) {
          console.debug("PersistLogin: verification complete");
          dispatch(setLoading(false));
          setVerifying(false);
        }
      }
    };

    verify();

    return () => {
      ignore = true;
    };
  }, [token, user, persist, refresh, triggerGetMe, dispatch]);

  // Loading state
  if (isLoading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Refresh failed
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

  // Auth ready
  return <Outlet />;
}
