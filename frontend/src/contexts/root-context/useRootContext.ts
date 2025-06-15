import { useContext } from "react";
import { RootContext } from "./RootContext";

export const useRootContext = () => {
    return useContext(RootContext);
};
