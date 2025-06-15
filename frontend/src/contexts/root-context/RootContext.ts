import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";

export interface RootContextType {
    initialPromptText: string;
    setInitialPromptText: Dispatch<SetStateAction<string>>;
}

export const RootContext = createContext<RootContextType>({
    initialPromptText: "",
    setInitialPromptText: () => {},
});
