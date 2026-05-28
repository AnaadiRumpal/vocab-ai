"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useThemeMode();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}