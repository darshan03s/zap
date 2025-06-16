import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";

export interface RootContextType {
    initialPromptText: string;
    setInitialPromptText: Dispatch<SetStateAction<string>>;
    initialSelectedImages: File[];
    setInitialSelectedImages: Dispatch<SetStateAction<File[]>>;
}

export const RootContext = createContext<RootContextType>({
    initialPromptText: "",
    setInitialPromptText: () => {},
    initialSelectedImages: [],
    setInitialSelectedImages: () => {},
});
