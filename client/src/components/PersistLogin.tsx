import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useRefreshMutation } from '../store/api/authApi';
import { setAccessToken, setUser, clearAuth, setLoading } from '../store/slices/authSlice';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1';

interface PersistLoginProps {
  children: React.ReactNode;
}

export default function PersistLogin({ children }: PersistLoginProps) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [refresh] = useRefreshMutation();
  const [ready, setReady] = useState(false);
  // console.log('PersistLogin render, accessToken:', accessToken);

  useEffect(() => {
    let mounted = true;

    async function ensureAuth() {
      if (accessToken) {
        // already have in-memory token
        // console.log('PersistLogin: existing access token found, skipping refresh');

        if (mounted) setReady(true);
        return;
      }

      try {
        // console.log('PersistLogin: no access token found, attempting refresh');
        // try silent refresh (server will read httpOnly cookie)
        const r = await refresh().unwrap();
        // console.log('PersistLogin: refresh response', r);
        if (r?.accessToken) {
          dispatch(setAccessToken(r.accessToken));
          // deterministically fetch /auth/me using the fresh access token
          try {
            const resp = await fetch(`${API_BASE}/auth/me`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${r.accessToken}`,
              },
              credentials: 'include',
            });

            if (resp.ok) {
              const body = await resp.json();
              if (body?.user) {
                dispatch(setUser(body.user));
              } else {
                // fallback to token decode
                try {
                  const parts = r.accessToken.split('.');
                  if (parts.length === 3) {
                    const payload = parts[1];
                    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                    const parsed = JSON.parse(json);
                    dispatch(setUser(parsed));
                  } else {
                    dispatch(clearAuth());
                  }
                } catch (e) {
                  console.warn('PersistLogin: failed to decode token payload', e);
                  dispatch(clearAuth());
                }
              }
            } else {
              // server returned non-OK for /me
              dispatch(clearAuth());
            }
          } catch (e) {
            console.warn('PersistLogin: /auth/me fetch failed', e);
            dispatch(clearAuth());
          }
        } else {
          dispatch(clearAuth());
        }
      } catch {
        dispatch(clearAuth());
      } finally {
        if (mounted) {
          setReady(true);
          // mark auth loading as finished for the rest of the app
          dispatch(setLoading(false));
        }
      }
    }

    ensureAuth();

    return () => {
      mounted = false;
    };
  }, [accessToken, dispatch, refresh]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
