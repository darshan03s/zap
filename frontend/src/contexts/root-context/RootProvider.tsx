import { useState } from "react";
import { RootContext, type Chat } from "./RootContext";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
    const [initialPromptText, setInitialPromptText] = useState("");
    const [initialSelectedImages, setInitialSelectedImages] = useState<File[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return <RootContext.Provider
        value={{
            initialPromptText,
            setInitialPromptText,
            initialSelectedImages,
            setInitialSelectedImages,
            chats,
            setChats,
            isSidebarOpen,
            setIsSidebarOpen,
        }}>
        {children}
    </RootContext.Provider>;
};

