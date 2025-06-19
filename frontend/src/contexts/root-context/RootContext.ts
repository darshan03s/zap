import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";

export interface Chat {
    chat_id: string;
    project_id: string;
    created_at: string;
    title: string;
}
export interface RootContextType {
    initialPromptText: string;
    setInitialPromptText: Dispatch<SetStateAction<string>>;
    initialSelectedImages: File[];
    setInitialSelectedImages: Dispatch<SetStateAction<File[]>>;
    chats: Chat[];
    setChats: Dispatch<SetStateAction<Chat[]>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const RootContext = createContext<RootContextType>({
    initialPromptText: "",
    setInitialPromptText: () => {},
    initialSelectedImages: [],
    setInitialSelectedImages: () => {},
    chats: [],
    setChats: () => {},
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
});
