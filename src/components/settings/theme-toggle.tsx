"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("maxpro-theme") as Theme | null;
    const initial =
      stored ??
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("maxpro-theme", next);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Theme</p>
        <p className="text-xs text-muted-foreground">
          Light or dark — saved on this device
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={toggle}>
        {theme === "light" ? (
          <>
            <Moon className="size-4" />
            Dark
          </>
        ) : (
          <>
            <Sun className="size-4" />
            Light
          </>
        )}
      </Button>
    </div>
  );
}
