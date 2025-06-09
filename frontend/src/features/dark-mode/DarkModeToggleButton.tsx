import { useDarkMode } from "./useDarkMode";
import { Sun, Moon } from "lucide-react";

const DarkModeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="rounded-full size-7 bg-black text-white dark:bg-white dark:text-black flex justify-center items-center"
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default DarkModeToggleButton;
