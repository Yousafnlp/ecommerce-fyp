import { Sun, Moon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ThemeMenuItem() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation(); // keeps dropdown open
    e.preventDefault();

    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
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
