'use client'

import { useEffect, useRef } from 'react'
import { WebContainerProcess } from '@webcontainer/api'
import { FitAddon } from '@xterm/addon-fit'
import { IDisposable, Terminal as XtermTerminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { Copy, Hammer, Play, RotateCcw, Square, TerminalIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useProps, useTerminal, useWebContainer } from './hooks'

export const Terminal = () => {
  const { startShell, isMounted, setServerUrl, setShellProcessWriter } = useWebContainer()
  const {
    terminalRef,
    fitAddonRef,
    shellProcessRef,
    isTerminalStarted,
    setIsTerminalStarted,
    isTerminalOpen,
    setIsTerminalOpen,
    getTerminalOutput,
    startDevServer,
    stopDevServer,
    restartDevServer,
    runBuild
  } = useTerminal()
  const { terminalReadOnly, hideTerminal, openTerminal, terminalTheme } = useProps()
  const terminalEleRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMounted) return
    const fitAddon = new FitAddon()
    const terminal = new XtermTerminal({
      cursorStyle: 'bar',
      cursorBlink: true,
      convertEol: true
    })
    terminal.options.disableStdin = terminalReadOnly
    terminal.options.theme = terminalTheme
    terminal.loadAddon(fitAddon)
    terminal.open(terminalEleRef.current!)
    fitAddon.fit()
    terminalRef.current = terminal
    fitAddonRef.current = fitAddon
    terminal.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key.toLocaleLowerCase() === 'c' && event.type === 'keydown') {
        setServerUrl('')
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'v' && event.type === 'keydown') {
        if (terminalReadOnly) return true
        event.preventDefault()
        navigator.clipboard.readText().then(async (text) => {
          terminal.paste(text)
        })
      }
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === 'c' &&
        event.type === 'keydown'
      ) {
        event.preventDefault()
        const selection = terminal.getSelection()
        navigator.clipboard.writeText(selection)
      }
      return true
    })

    return () => {
      terminal.dispose()
    }
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return

    let disposed = false
    let jsh: WebContainerProcess | null = null
    let writer: WritableStreamDefaultWriter<string> | null = null
    let disposable: IDisposable | null = null

    async function init() {
      const { shellProcess, inputWriter, iDisposable } = await startShell(terminalRef.current!)

      if (disposed) {
        shellProcess.kill()
        inputWriter.releaseLock()
        iDisposable.dispose()
        return
      }

      jsh = shellProcess
      writer = inputWriter
      disposable = iDisposable

      shellProcessRef.current = jsh
      setShellProcessWriter(inputWriter)
      setIsTerminalStarted(true)
    }

    init()

    if (openTerminal) {
      setIsTerminalOpen(true)
    }

    return () => {
      disposed = true
      jsh?.kill()
      writer?.releaseLock()
      disposable?.dispose()
      shellProcessRef.current = null
      setShellProcessWriter(null)
      setIsTerminalStarted(false)
    }
  }, [isMounted])

  useEffect(() => {
    if (!isTerminalStarted) return

    function resize() {
      fitAddonRef.current!.fit()
      shellProcessRef.current!.resize({
        cols: terminalRef.current!.cols,
        rows: terminalRef.current!.rows
      })
    }

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [isTerminalStarted])

  useEffect(() => {
    if (!terminalRef.current) return

    terminalRef.current.options.theme = terminalTheme
  }, [terminalTheme])

  const showTerminal = (() => {
    if (hideTerminal) return false
    return isTerminalOpen
  })()

  return (
    <div
      onScroll={(e) => e.stopPropagation()}
      className={cn(
        'ide-terminal',
        'absolute right-0 bottom-0 w-full',
        '[--terminal-height:--spacing(46)]',
        showTerminal ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div
        hidden={!isTerminalStarted}
        className="terminal-header bg-background flex h-8 items-center justify-between border px-2 select-none"
      >
        <span className="text-foreground [&_svg]:text-foreground flex items-center gap-2 font-mono text-xs [&_svg]:size-3">
          <TerminalIcon /> Terminal
        </span>
        <div className="flex items-center gap-2">
          <div>
            <Button
              variant={'ghost'}
              size={'icon-xs'}
              onClick={() => {
                runBuild()
              }}
              disabled={!isMounted}
              title="Run Build"
            >
              <Hammer />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon-xs'}
              onClick={() => {
                restartDevServer()
              }}
              disabled={!isMounted}
              title="Restart Dev Server"
            >
              <RotateCcw />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon-xs'}
              onClick={() => {
                stopDevServer()
              }}
              disabled={!isMounted}
              title="Stop Dev Server"
            >
              <Square />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon-xs'}
              onClick={() => {
                startDevServer()
              }}
              disabled={!isMounted}
              title="Start Dev Server"
            >
              <Play />
            </Button>
            <Button
              variant={'ghost'}
              size={'icon-xs'}
              onClick={() => {
                const { text } = getTerminalOutput(undefined, true)
                if (text) {
                  navigator.clipboard.writeText(text)
                }
              }}
              disabled={!isMounted}
              title="Copy Terminal Output"
            >
              <Copy />
            </Button>
          </div>
          <Button
            variant={'ghost'}
            size={'icon-xs'}
            onClick={() => setIsTerminalOpen(false)}
            title="Close"
          >
            <X />
          </Button>
        </div>
      </div>
      <div
        ref={terminalEleRef}
        className={cn(
          '[&_.terminal]:h-full [&_.terminal]:max-h-(--terminal-height) [&_.terminal:first-of-type~.terminal]:hidden!',
          '[&_.xterm-screen]:h-(--terminal-height)!',
          '[&_.xterm-scrollable-element]:p-2',
          '[&_.xterm-viewport]:no-scrollbar!',
          '[&_.xterm-rows]:h-full! [&_.xterm-rows]:font-mono! [&_.xterm-rows]:text-xs! [&_.xterm-rows>div:first-child:empty]:hidden'
        )}
      />
    </div>
  )
}
