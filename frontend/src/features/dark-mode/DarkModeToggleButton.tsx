import { useDarkMode } from "./useDarkMode";
import { Sun, Moon } from "lucide-react";

const DarkModeToggleButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="rounded-full size-7 dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth flex justify-center items-center"
    >
      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default DarkModeToggleButton;
