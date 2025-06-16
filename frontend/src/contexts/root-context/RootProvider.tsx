import { useState } from "react";
import { RootContext } from "./RootContext";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
    const [initialPromptText, setInitialPromptText] = useState("");
    const [initialSelectedImages, setInitialSelectedImages] = useState<File[]>([]);

    return <RootContext.Provider
        value={{
            initialPromptText,
            setInitialPromptText,
            initialSelectedImages,
            setInitialSelectedImages,
        }}>
        {children}
    </RootContext.Provider>;
};

