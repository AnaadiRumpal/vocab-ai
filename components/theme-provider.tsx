"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext<{
  theme: ThemeMode;
  toggleTheme: () => void;
  mounted: boolean;
} | null>(null);

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      mounted,
      toggleTheme: () =>
        setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme, mounted]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider.");
  }

  return context;
}