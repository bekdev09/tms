import { useAppSelector } from "../../store/hooks";
// import { UserPlus, Home } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import UserMenu from "./UserMenu";

export default function DashboardNavbar() {
  // const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {user?.email}
            </span>
            <ThemeToggle />

            {/* {location.pathname === '/dashboard/register' ? (
              <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-medium shadow-sm hover:shadow transition-all">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link to="/dashboard/register" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-xl transition-all">
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            )} */}

            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
