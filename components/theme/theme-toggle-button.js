'use client';
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";
export function ThemeToggleButton() {
  const [theme, setTheme] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  const toggleTheme = e => {
    e.stopPropagation();
    e.preventDefault();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  return <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="ml-2">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>;
}