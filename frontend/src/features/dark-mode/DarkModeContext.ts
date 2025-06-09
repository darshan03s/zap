import { createContext } from "react";

type DarkModeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
};

export const DarkModeContext = createContext<DarkModeContextType | undefined>(
    undefined
);