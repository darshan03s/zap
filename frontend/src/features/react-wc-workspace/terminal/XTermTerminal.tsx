import { useEffect } from 'react'
import { useWebContainer } from '../webcontainer/useWebContainer'
import { useTerminal } from './useTerminal';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { WebLinksAddon } from '@xterm/addon-web-links';

import '@xterm/xterm/css/xterm.css';
import './xtermTerminalStyles.css';

const ANSI_COLORS = {
    "black": "#000000",
    "red": "#800000",
    "green": "#008000",
    "yellow": "#808000",
    "blue": "#0000CD",
    "magenta": "#800080",
    "cyan": "#008080",
    "white": "#c0c0c0",
    "brightBlack": "#000000",
    "brightRed": "#ff0000",
    "brightGreen": "#00ff00",
    "brightYellow": "#ffff00",
    "brightBlue": "#0000ff",
    "brightMagenta": "#ff00ff",
    "brightCyan": "#00ffff",
    "brightWhite": "#ffffff"
}

const XTermTerminal = () => {
    const { webContainer } = useWebContainer()
    const { terminalEl, setShellProcess, setTerminal, setFitAddon, setInputProcess, deleteTerminal, isShellReady, setIsShellReady } = useTerminal()

    useEffect(() => {
        const terminalInit = async () => {
            if (!webContainer) return;
            const fitAddon = new FitAddon();
            const webLinksAddon = new WebLinksAddon();
            const terminal = new Terminal({
                convertEol: true,
                cursorStyle: 'bar',
                scrollOnUserInput: true,
                fontFamily: 'Menlo, "Cascadia Code", "Courier New", monospace',

                theme: {
                    background: '#000000',
                    cursor: '#FFFFFF',
                    ...ANSI_COLORS
                }
            });
            setTerminal(terminal)
            setFitAddon(fitAddon)
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(webLinksAddon);
            fitAddon.fit();
            terminal.open(terminalEl.current as HTMLElement);

            webContainer?.spawn('jsh', {
                terminal: {
                    cols: terminal.cols,
                    rows: terminal.rows,
                },
            }).then((shellProcess) => {
                setShellProcess(shellProcess)
                shellProcess.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            terminal.write(data);
                            if (!isShellReady && data.includes('~/')) {
                                setIsShellReady(true)
                            }
                        },
                    })
                );

                const input = shellProcess.input.getWriter();
                setInputProcess(input)
                terminal.onData((data) => {
                    input.write(data);
                });

                const resizeObserver = new ResizeObserver(() => {
                    fitAddon.fit();
                    shellProcess.resize({
                        cols: terminal.cols,
                        rows: terminal.rows,
                    });
                });

                resizeObserver.observe(terminalEl.current as HTMLElement);

                window.addEventListener('resize', () => {
                    fitAddon.fit();
                    shellProcess.resize({
                        cols: terminal.cols,
                        rows: terminal.rows,
                    });
                });
            })

            return () => {
                deleteTerminal();
            }
        }
        terminalInit()
    }, [webContainer]);

    return (
        <div ref={terminalEl} className={`w-full overflow-x-auto h-full hide-scrollbar bg-black`}></div>
    )
}

export default XTermTerminal