import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { mode, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      {mode === 'light' ? (
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
}
