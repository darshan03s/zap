import { useContext } from 'react'
import { FileSystemContext } from './providers/filesystem-provider'
import { PropsContext } from './providers/props-provider'
import { TerminalContext } from './providers/terminal-provider'
import { WebContainerIDEContext } from './providers/webcontainer-ide-provider'
import { WebContainerContext } from './providers/webcontainer-provider'

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}

export const useWebContainer = () => {
  const context = useContext(WebContainerContext)
  if (!context) {
    throw new Error('useWebContainer must be used within a WebContainerProvider')
  }
  return context
}

export const useTerminal = () => {
  const context = useContext(TerminalContext)
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider')
  }
  return context
}

export const useIde = () => {
  const context = useContext(WebContainerIDEContext)
  if (!context) {
    throw new Error('useIde must be used within a WebContainerIDEProvider')
  }
  return context
}

export const useProps = () => {
  const context = useContext(PropsContext)
  if (!context) {
    throw new Error('useProps must be used within a PropsProvider')
  }
  return context
}
