'use client'

import { useEffect, useRef } from 'react'
import { Code, Eye, PanelLeft, PanelRight, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { ResizableHandle, ResizablePanelGroup } from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { FileSystem } from './file-system'
import { useFileSystem, useIde, useProps, useTerminal, useWebContainer } from './hooks'
import { PropsProvider } from './providers/props-provider'
import { WebContainerIDEProps } from './types'
import { Workspace } from './workspace'

export const WebContainerIDE = ({ ...props }: WebContainerIDEProps) => {
  return (
    <PropsProvider {...props}>
      <Comp />
    </PropsProvider>
  )
}

export const Comp = () => {
  const { isMounted, wc, setIsMounted, setServerUrl, activePath } = useWebContainer()
  const { view, toggleView } = useIde()
  const { toggleFileSystem, fileSystemOpen, setFs } = useFileSystem()
  const { setIsTerminalOpen } = useTerminal()
  const { loadFromSnapshot, className, hideTerminal } = useProps()
  const cleanupRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false

    async function init() {
      await cleanupRef.current

      if (cancelled || !wc) return

      if (loadFromSnapshot) {
        if (typeof loadFromSnapshot === 'string') {
          const response = await fetch(loadFromSnapshot)
          const snapshot = await response.arrayBuffer()
          await wc.mount(snapshot)
        } else {
          await wc.mount(loadFromSnapshot)
        }
      }

      if (!cancelled) {
        setIsMounted(true)
      }
    }

    init()

    return () => {
      cancelled = true

      cleanupRef.current = (async () => {
        if (!wc) return

        const entries = await wc.fs.readdir('/')

        await Promise.all(
          entries.map((entry) =>
            wc.fs.rm(entry, {
              recursive: true,
              force: true
            })
          )
        )
        setFs({})
        setIsMounted(false)
        setServerUrl('')
        activePath('')
      })()
    }
  }, [wc, loadFromSnapshot])

  function handleTerminalToggle() {
    setIsTerminalOpen((prev) => !prev)
  }

  return (
    <div
      className={cn(
        'ide-container relative flex h-(--ide-height) w-(--ide-width) flex-col rounded-lg overflow-clip border [--ide-height:--spacing(140)] [--ide-width:--spacing(240)]',
        className
      )}
    >
      <div className="ide-header bg-background flex h-10 min-h-10 items-center justify-between border-b px-2">
        <div className="flex items-center gap-4">
          <Button
            className="ide-file-system-toggle"
            size={'icon-xs'}
            variant={'ghost'}
            onClick={toggleFileSystem}
            title="Toggle files"
          >
            {fileSystemOpen ? <PanelLeft /> : <PanelRight />}
          </Button>
          <ButtonGroup>
            <Button
              className="ide-editor-toggle"
              size={'icon-xs'}
              variant={view === 'editor' ? 'default' : 'outline'}
              onClick={toggleView}
              title="Editor"
            >
              <Code />
            </Button>
            <Button
              className="ide-preview-toggle"
              size={'icon-xs'}
              variant={view === 'preview' ? 'default' : 'outline'}
              onClick={toggleView}
              title="Preview"
            >
              <Eye />
            </Button>
          </ButtonGroup>
        </div>
        {hideTerminal ? null : (
          <Button
            className="ide-terminal-toggle"
            variant={'outline'}
            size={'icon-xs'}
            onClick={handleTerminalToggle}
            disabled={!isMounted}
            title="Toggle terminal"
          >
            <Terminal />
          </Button>
        )}
      </div>
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex min-h-0 flex-1 [--fs-width:--spacing(64)] [--inner-header-height:--spacing(8)]"
      >
        <FileSystem />
        <ResizableHandle />
        <Workspace />
      </ResizablePanelGroup>
    </div>
  )
}
