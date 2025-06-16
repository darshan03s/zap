import { createContext } from "react";

type DarkModeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(
    undefined
);

export default DarkModeContext;
