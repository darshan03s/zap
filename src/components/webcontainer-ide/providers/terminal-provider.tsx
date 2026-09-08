'use client'

import { Dispatch, RefObject, SetStateAction, createContext, useRef, useState } from 'react'
import { WebContainerProcess } from '@webcontainer/api'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XtermTerminal } from '@xterm/xterm'
import { useWebContainer } from '../hooks'

type WriteToTerminal = (command: string) => void

type TerminalContext = {
  terminalRef: RefObject<XtermTerminal | null>
  fitAddonRef: RefObject<FitAddon | null>
  shellProcessRef: RefObject<WebContainerProcess | null>
  isTerminalStarted: boolean
  setIsTerminalStarted: Dispatch<SetStateAction<boolean>>
  isTerminalOpen: boolean
  setIsTerminalOpen: Dispatch<SetStateAction<boolean>>
  writeToTerminal: WriteToTerminal
  getTerminalOutput: (lastN?: number) => { text: string; lines: string[] }
  startDevServer: () => void
  stopDevServer: () => void
  restartDevServer: () => void
  runBuild: () => void
}

export const TerminalContext = createContext<TerminalContext | null>(null)

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
  const terminalRef = useRef<XtermTerminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)
  const [isTerminalStarted, setIsTerminalStarted] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const { shellProcessWriter, setServerUrl } = useWebContainer()

  const writeToTerminal: WriteToTerminal = (command) => {
    setTimeout(() => {
      shellProcessWriter?.write(command)
    }, 300)
  }

  const getTerminalOutput = (lastN?: number) => {
    terminalRef.current?.selectAll()
    const selection = terminalRef.current?.getSelection()
    if (selection) {
      const lines = selection.split('\n')
      const cleanedLines = lines.filter((line) => line.trim() !== '')
      const lastNLines = lastN ? cleanedLines.slice(-lastN) : cleanedLines
      const text = lastNLines.join('\n')
      terminalRef.current?.clearSelection()
      return { text, lines: lastNLines }
    }
    terminalRef.current?.clearSelection()
    return { text: '', lines: [] }
  }

  const startDevServer = () => {
    writeToTerminal('npm install && npm run dev\n')
  }

  const stopDevServer = () => {
    writeToTerminal('\x03')
    setServerUrl('')
  }

  const restartDevServer = () => {
    stopDevServer()
    setTimeout(() => {
      startDevServer()
    }, 1000)
  }

  const runBuild = () => {
    writeToTerminal('npm install && npm run build\n')
  }

  return (
    <TerminalContext.Provider
      value={{
        terminalRef,
        fitAddonRef,
        shellProcessRef,
        isTerminalStarted,
        setIsTerminalStarted,
        isTerminalOpen,
        setIsTerminalOpen,
        writeToTerminal,
        getTerminalOutput,
        startDevServer,
        stopDevServer,
        restartDevServer,
        runBuild
      }}
    >
      {children}
    </TerminalContext.Provider>
  )
}
