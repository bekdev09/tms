import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { LogOut, UserPlus, Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useLogoutMutation } from '../store/api/authApi';
import { clearAuth } from '../store/slices/authSlice';

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      console.warn('logout failed', e);
    } finally {
      dispatch(clearAuth());
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</span>
            <ThemeToggle />

            {location.pathname === '/dashboard/register' ? (
              <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-medium shadow-sm hover:shadow transition-all">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link to="/dashboard/register" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-xl transition-all">
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            )}

            <button onClick={() => setConfirming(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {confirming && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-30" onClick={() => setConfirming(false)} aria-hidden />
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 z-10 shadow-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                  <p className="mb-4 text-slate-800 dark:text-slate-200">Are you sure you want to logout?</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-lg border dark:text-white">Cancel</button>
                    <button onClick={async () => { setConfirming(false); await handleLogout(); }} className="px-4 py-2 rounded-lg bg-red-500 text-white">Logout</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
