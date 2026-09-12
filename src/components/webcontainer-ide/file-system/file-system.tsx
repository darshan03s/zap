'use client'

import { DragEvent, useEffect } from 'react'
import { ResizablePanel } from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useFileSystem, useProps, useWebContainer } from '../hooks'
import { getParentFolder } from '../utils'
import { FsTree } from './fs-tree'
import { FileSystemHeader } from './header'
import { NewFsItem } from './new-fs-item'

export const FileSystem = () => {
  const {
    fileSystemOpen,
    fs,
    loadFolderItems,
    newFsItem,
    setNewFsItem,
    collapseAllFolders,
    draggedItem,
    hoveredPath,
    setHoveredPath,
    endFsItemMove,
    handleFsItemDrop
  } = useFileSystem()
  const { isMounted, rootDir, wc } = useWebContainer()
  const { disableCreateFolder, disableCreateFile, disableMoving } = useProps()

  logger.info('[FS-OBJECT]', fs)

  useEffect(() => {
    if (!wc || !isMounted) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let pendingEventCount = 0
    const affectedParents = new Set<string>()

    const unsubscribe = wc.internal.watchPaths(
      { path: `${rootDir}/**`, exclude: ['node_modules', '.git'] },
      (events) => {
        pendingEventCount += events.length

        for (const event of events) {
          const eventType = event.type
          if (eventType === 'change') continue
          const path = event.path
          const normalizedPath = path.replace(`/home/${rootDir}/`, '')
          logger.info(`${eventType} ${normalizedPath}`)
          affectedParents.add(getParentFolder(normalizedPath))
        }

        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          const topmostParent = [...affectedParents].sort(
            (a, b) => a.split('/').filter(Boolean).length - b.split('/').filter(Boolean).length
          )[0]

          logger.info(`[FS-EVENT] watch events ended (${pendingEventCount} events)`)
          if (topmostParent) {
            loadFolderItems(topmostParent)
          }
          pendingEventCount = 0
          affectedParents.clear()
        }, 200)
      }
    )

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      unsubscribe()
    }
  }, [wc, isMounted])

  useEffect(() => {
    if (!isMounted) return
    loadFolderItems('/')
  }, [isMounted])

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    setHoveredPath('/')
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    handleFsItemDrop(source, '/')

    endFsItemMove()
  }

  return (
    <ResizablePanel
      defaultSize={'25%'}
      className={cn('ide-file-system-container relative flex flex-col border-r text-xs')}
      hidden={!fileSystemOpen}
    >
      <FileSystemHeader
        rootDir={rootDir}
        handleNewFolder={() => {
          setNewFsItem({
            type: 'folder',
            parent: '/'
          })
        }}
        handleNewFile={() => {
          setNewFsItem({
            type: 'file',
            parent: '/'
          })
        }}
        handleCollapseAll={collapseAllFolders}
        disableCreateFolder={disableCreateFolder}
        disableCreateFile={disableCreateFile}
      />
      {!isMounted ? (
        <div className="ide-file-system-loading flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div
          className={cn(
            'ide-file-system-tree no-scrollbar flex flex-1 flex-col gap-1 overflow-scroll p-1'
          )}
        >
          {newFsItem?.parent === '/' && <NewFsItem />}
          {fs['/'] && <FsTree fsItems={fs['/']} />}
          <div
            onDragOver={!disableMoving ? onDragOver : undefined}
            onDrop={!disableMoving ? onDrop : undefined}
            className={cn(
              'ide-file-system-root-dropzone min-h-20 grow',
              hoveredPath === '/' && 'ring-1 ring-ring'
            )}
          ></div>
        </div>
      )}
    </ResizablePanel>
  )
}
