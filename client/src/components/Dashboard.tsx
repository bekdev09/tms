import { Outlet } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <DashboardNavbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
