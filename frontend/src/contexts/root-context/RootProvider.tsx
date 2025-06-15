import { useState } from "react";
import { RootContext } from "./RootContext";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
    const [initialPromptText, setInitialPromptText] = useState("");

    return <RootContext.Provider
        value={{
            initialPromptText,
            setInitialPromptText,
        }}>
        {children}
    </RootContext.Provider>;
};

