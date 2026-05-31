"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-24
          w-24
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-xl
        "
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
        }}
/>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        title="Toggle theme"
        disabled={!mounted}
        onClick={() =>
          setTheme(
            resolvedTheme === "dark"
              ? "light"
              : "dark"
          )
        }
        className="
          relative
          h-9
          w-9
          rounded-full
          bg-background/50
          backdrop-blur-sm
          border
          shadow-sm
        "
      >
        {!mounted ? (
          <span className="h-4 w-4" />
        ) : resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}