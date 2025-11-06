// src/features/theme/hooks/useTheme.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTheme, toggleTheme } from "../store/slices/themeSlice";

export function useTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  // Sync DOM & storage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  // On mount: initialize from storage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      dispatch(setTheme(stored));
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dispatch(setTheme(prefersDark ? "dark" : "light"));
    }
  }, [dispatch]);

  return {
    mode,
    isDark: mode === "dark",
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (theme: "light" | "dark") => dispatch(setTheme(theme)),
  };
}
