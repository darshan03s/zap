import { useEffect, useState, type ReactNode } from "react";
import { DarkModeContext } from "./DarkModeContext";

const DARK_MODE_STORAGE_KEY = "theme";

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false; // SSR fallback
  const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (stored !== null) return stored === "dark";
  return false;
}

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.setAttribute("data-theme", "dark");
  } else {
    html.removeAttribute("data-theme");
  }
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    applyTheme(isDarkMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const setDarkMode = (value: boolean) => setIsDarkMode(value);

  return (
    <DarkModeContext.Provider
      value={{ isDarkMode, toggleDarkMode, setDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};
