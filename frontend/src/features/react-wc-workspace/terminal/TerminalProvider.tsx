import { useState, useRef } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import type { WebContainerProcess } from '@webcontainer/api';
import TerminalContext from './TerminalContext';

const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
    const terminalEl = useRef<HTMLDivElement>(null)
    const [terminal, setTerminal] = useState<Terminal | null>(null)
    const [fitAddon, setFitAddon] = useState<FitAddon | null>(null)
    const [shellProcess, setShellProcess] = useState<WebContainerProcess | null>(null)
    const [inputProcess, setInputProcess] = useState<WritableStreamDefaultWriter | null>(null)
    const [showTerminal, setShowTerminal] = useState(false)
    const [isShellReady, setIsShellReady] = useState(false)

    function deleteTerminal() {
        if (!terminal || !fitAddon || !shellProcess || !inputProcess) {
            return
        }

        setTerminal(null)
        setFitAddon(null)
        setShellProcess(null)
        setInputProcess(null)

        terminal.dispose();
        fitAddon.dispose();
        shellProcess?.exit.then((code: number) => {
            console.log('shell process exited', code)
        });
        inputProcess?.close();
    }

    return (
        <TerminalContext.Provider value={{
            terminal,
            setTerminal,
            fitAddon,
            setFitAddon,
            shellProcess,
            setShellProcess,
            terminalEl,
            inputProcess,
            setInputProcess,
            deleteTerminal,
            showTerminal,
            setShowTerminal,
            isShellReady,
            setIsShellReady
        }}>
            {children}
        </TerminalContext.Provider>
    )
}

export default TerminalProvider
