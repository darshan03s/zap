import { useDarkMode } from "./useDarkMode";
import { Sun, Moon } from "lucide-react";

const DarkModeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="rounded-full size-6 bg-black text-white dark:bg-white dark:text-black flex justify-center items-center colors-smooth"
    >
      {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
};

export default DarkModeToggleButton;
