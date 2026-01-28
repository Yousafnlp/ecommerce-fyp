'use client';
import { Sun, Moon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
export function ThemeMenuItem() {
  const [theme, setTheme] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  const toggleTheme = e => {
    e.stopPropagation();
    e.preventDefault();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  return <DropdownMenuItem onClick={toggleTheme}>
      {theme === "light" ? <>
          <Moon className="mr-2 h-4 w-4" />
          Dark Mode
        </> : <>
          <Sun className="mr-2 h-4 w-4" />
          Light Mode
        </>}
    </DropdownMenuItem>;
}