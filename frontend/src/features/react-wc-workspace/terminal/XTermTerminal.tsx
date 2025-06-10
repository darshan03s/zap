import { useEffect } from 'react'
import { useWebContainer } from '../webcontainer/useWebContainer'
import { useTerminal } from './useTerminal';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';

import '@xterm/xterm/css/xterm.css';
import './xtermTerminalStyles.css';

const XTermTerminal = () => {
    const { webContainer } = useWebContainer()
    const { terminalEl, setShellProcess, shellProcess, setTerminal, setFitAddon, setInputProcess, inputProcess } = useTerminal()

    useEffect(() => {
        const terminalInit = async () => {
            if (!webContainer) return;
            const fitAddon = new FitAddon();
            const terminal = new Terminal({
                convertEol: true,
                cursorStyle: 'bar',
                scrollOnUserInput: true,
                fontFamily: 'Cascadia Code',
                theme: {
                    black: '#030712',
                    background: '#030712',
                }
            });
            setTerminal(terminal)
            setFitAddon(fitAddon)
            terminal.loadAddon(fitAddon);
            fitAddon.fit();
            terminal.open(terminalEl.current as HTMLElement);

            await webContainer.spawn('mkdir', ['~/project']);

            webContainer?.spawn('/bin/jsh', ['--osc'], {
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
                        },
                    })
                );

                const input = shellProcess.input.getWriter();
                setInputProcess(input)
                terminal.onData((data) => {
                    input.write(data);
                });

                window.addEventListener('resize', () => {
                    fitAddon.fit();
                    shellProcess.resize({
                        cols: terminal.cols,
                        rows: terminal.rows,
                    });
                });
            })

            return () => {
                terminal.dispose();
                fitAddon.dispose();
                shellProcess?.exit.then((code: number) => {
                    console.log('shell process exited', code)
                });
                inputProcess?.close();
            }
        }
        terminalInit()
    }, [webContainer]);

    return (
        <div ref={terminalEl} className='w-full overflow-x-auto'></div>
    )
}

export default XTermTerminal