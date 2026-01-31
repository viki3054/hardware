"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.dataset.theme;
  return t === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle({
  variant = "ghost",
  size = "sm",
  className,
}: {
  variant?: "ghost" | "outline" | "secondary" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial: Theme = saved === "dark" || saved === "light" ? saved : getSystemTheme();
      applyTheme(initial);
      setTheme(initial);
    } catch {
      const initial = getSystemTheme();
      applyTheme(initial);
      setTheme(initial);
    }
  }, []);

  const next = useMemo<Theme>(() => (theme === "dark" ? "light" : "dark"), [theme]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        const current = getCurrentTheme();
        const n: Theme = current === "dark" ? "light" : "dark";
        applyTheme(n);
        setTheme(n);
        try {
          localStorage.setItem(STORAGE_KEY, n);
        } catch {
          // ignore
        }
      }}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden min-[420px]:inline">{next === "dark" ? "Dark" : "Light"}</span>
    </Button>
  );
}
