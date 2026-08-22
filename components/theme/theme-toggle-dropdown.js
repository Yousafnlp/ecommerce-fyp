'use client';
import { Sun, Moon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

// Runtime-only theme switch: starts from light every session, never persists
// (no localStorage/cookies/db) and never follows prefers-color-scheme.
export function ThemeMenuItem() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = (event) => {
    // Keep the dropdown open so the user sees the mode switch in place.
    event.preventDefault();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <DropdownMenuItem onSelect={toggleTheme}>
      {theme === "light" ? (
        <>
          <Moon className="mr-2 h-4 w-4" />
          Dark Mode
        </>
      ) : (
        <>
          <Sun className="mr-2 h-4 w-4" />
          Light Mode
        </>
      )}
    </DropdownMenuItem>
  );
}
