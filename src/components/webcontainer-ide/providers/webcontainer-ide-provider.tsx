'use client'

import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { FileSystemProvider } from './filesystem-provider'
import { TerminalProvider } from './terminal-provider'
import { WebContainerProvider } from './webcontainer-provider'

type View = 'editor' | 'preview'

type ToggleView = () => void

type WebContainerIDEContext = {
  view: View
  setView: Dispatch<SetStateAction<View>>
  toggleView: ToggleView
}

export const WebContainerIDEContext = createContext<WebContainerIDEContext | null>(null)

export const WebContainerIDEProvider = ({
  children,
  rootDir
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  const [view, setView] = useState<View>('editor')

  const toggleView: ToggleView = () => {
    setView((prev) => {
      if (prev === 'editor') return 'preview'
      else if (prev === 'preview') return 'editor'
      return 'editor'
    })
  }

  return (
    <WebContainerIDEContext.Provider value={{ view, setView, toggleView }}>
      <WebContainerProvider rootDir={rootDir}>
        <FileSystemProvider>
          <TerminalProvider>{children}</TerminalProvider>
        </FileSystemProvider>
      </WebContainerProvider>
    </WebContainerIDEContext.Provider>
  )
}
