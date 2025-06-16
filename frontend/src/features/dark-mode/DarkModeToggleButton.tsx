import useDarkMode from "./useDarkMode";
import { Sun, Moon } from "lucide-react";

const DarkModeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="rounded-full size-8 dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth flex justify-center items-center"
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default DarkModeToggleButton;
