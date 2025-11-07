import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  // optional list of allowed roles (e.g. ['ADMIN','MANAGER'])
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAppSelector((state) => state.auth);
  // console.log('ProtectedRoute render, user:', user, 'loading:', loading, 'allowedRoles:', allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if allowedRoles specified, ensure user's role is included
  if (allowedRoles && allowedRoles.length > 0) {
    const role = (user && (user.role || user?.roles || user?.roleName)) as
      | string
      | undefined;
    // support user.role being string or array
    const hasRole = Array.isArray(role)
      ? role.some((r) => allowedRoles.includes(r))
      : !!role && allowedRoles.includes(role);
    if (!hasRole) {
      // unauthorized — redirect to dashboard or show a 403 page
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
