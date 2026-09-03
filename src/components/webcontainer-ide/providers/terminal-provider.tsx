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
}

export const TerminalContext = createContext<TerminalContext | null>(null)

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
  const terminalRef = useRef<XtermTerminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)
  const [isTerminalStarted, setIsTerminalStarted] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const { shellProcessWriter } = useWebContainer()

  const writeToTerminal: WriteToTerminal = (command) => {
    setTimeout(() => {
      shellProcessWriter?.write(command)
    }, 300)
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
        writeToTerminal
      }}
    >
      {children}
    </TerminalContext.Provider>
  )
}
