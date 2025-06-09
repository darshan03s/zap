import type { WebContainerProcess } from "@webcontainer/api";
import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { createContext } from "react";

const TerminalContext = createContext<{
    terminal: Terminal | null;
    setTerminal: (terminal: Terminal | null) => void;
    fitAddon: FitAddon | null;
    setFitAddon: (fitAddon: FitAddon | null) => void;
    shellProcess: WebContainerProcess | null;
    setShellProcess: (shellProcess: WebContainerProcess | null) => void;
    terminalEl: React.RefObject<HTMLDivElement | null>;
    inputProcess: WritableStreamDefaultWriter | null;
    setInputProcess: (inputProcess: WritableStreamDefaultWriter | null) => void;
} | null>(null);

export default TerminalContext;
