import { DragEvent, useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { IGNORED_FOLDERS } from '../constants'
import { useFileSystem, useProps, useWebContainer } from '../hooks'
import { FsItemDrag, ReadDirEntry } from '../types'
import { getParentFolder } from '../utils'
import { FsItemIcon } from './fs-item-icon'
import { FsItemOptions } from './fs-item-options'
import { FsTree } from './fs-tree'
import { InputComp } from './input-comp'
import { NewFsItem } from './new-fs-item'

export const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile, rename, rm, activePath } = useWebContainer()
  const {
    fs,
    handleFsItemClick,
    isFolderOpen,
    setNewFsItem,
    newFsItem,
    hoveredPath,
    setHoveredPath,
    draggedItem,
    openFolder,
    startFsItemMove,
    endFsItemMove,
    handleFsItemDrop,
    clearFolder,
    isIgnoredPath
  } = useFileSystem()
  const {
    disableCreateFolder,
    disableCreateFile,
    disableRenaming,
    disableDeleting,
    disableMoving
  } = useProps()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemPath = item.path
  const type = item.isDirectory() ? 'folder' : 'file'
  const parentFolder = getParentFolder(itemPath)
  const isIgnored = isIgnoredPath(itemPath)
  const isFolderItemOpen = isFolderOpen(itemPath)

  useEffect(() => {
    if (hoveredPath !== itemPath) return

    const id = window.setTimeout(() => {
      openFolder(hoveredPath)
    }, 2000)

    return () => clearTimeout(id)
  }, [hoveredPath, openFolder])

  function createFolder() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'folder',
      parent: itemPath
    })
  }

  function createFile() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'file',
      parent: itemPath
    })
  }

  function startRenameFolder() {
    setIsRenaming(true)
  }

  async function renameFsItem(form: HTMLFormElement) {
    const formData = new FormData(form)
    const fsItemName = formData.get('new-name')
    const newName = String(fsItemName).trim()
    if (newName === item.name) {
      setIsRenaming(false)
      return
    }
    if (newName.length > 0) {
      if (IGNORED_FOLDERS.has(newName)) return
      const prevPath = itemPath
      const newPath = parentFolder === '/' ? newName : `${parentFolder}/${newName}`
      await rename(itemPath, newPath)
      if (activeFile.path.startsWith(prevPath)) {
        activePath(activeFile.path.replace(prevPath, newPath))
      }
      clearFolder(prevPath)
      setIsRenaming(false)
    }
  }

  function startDeletingFolder() {
    setIsDeleting(true)
  }

  async function deleteFsItem() {
    await rm(itemPath, { recursive: true })
    if (activeFile.path.startsWith(itemPath)) {
      activePath('')
    }
    if (type === 'folder') {
      clearFolder(itemPath)
    }
    setIsDeleting(false)
  }

  function dragOrDropNotAllowed(source: FsItemDrag) {
    if (type === 'file') return true
    if (source.path === item.path) return true

    return false
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  function onDragStart() {
    startFsItemMove({
      name: item.name,
      path: itemPath,
      type
    })
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()

    const source = draggedItem.current
    if (!source) return

    if (dragOrDropNotAllowed(source)) return

    setHoveredPath(itemPath)
  }

  function onDragLeave() {
    setHoveredPath((path) => (path === itemPath ? null : path))
  }

  function onDragEnd() {
    endFsItemMove()
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()

    const source = draggedItem.current
    if (!source) return

    if (dragOrDropNotAllowed(source)) return

    handleFsItemDrop(source, itemPath)

    endFsItemMove()
  }

  return (
    <>
      <Item
        draggable
        onDragStart={!disableMoving ? onDragStart : undefined}
        onDragOver={!disableMoving ? onDragOver : undefined}
        onDragLeave={!disableMoving ? onDragLeave : undefined}
        onDragEnd={!disableMoving ? onDragEnd : undefined}
        onDrop={!disableMoving ? onDrop : undefined}
        size={'xs'}
        className={cn(
          'ide-file-system-item hover:bg-secondary group/fs-item m-0 h-6 min-h-6 cursor-pointer p-0 px-1 select-none',
          activeFile.path === itemPath && 'bg-secondary',
          hoveredPath === itemPath && 'ring-1 ring-ring'
        )}
        onClick={() => {
          if (isRenaming) return
          handleFsItemClick(item)
        }}
      >
        <ItemMedia className="[&_svg]:size-3!">
          <FsItemIcon type={type} isIgnored={isIgnored} isFolderItemOpen={isFolderItemOpen} />
        </ItemMedia>
        <ItemContent className="line-clamp-1 flex truncate text-xs">
          {isRenaming ? (
            <InputComp
              inputRef={inputRef}
              defaultValue={item.name}
              onSubmit={renameFsItem}
              onBlur={() => setIsRenaming(false)}
              name="new-name"
              placeholder={type === 'folder' ? 'Enter folder name' : 'Enter file name'}
            />
          ) : (
            item.name
          )}
        </ItemContent>
        <ItemActions>
          {isDeleting ? (
            <ButtonGroup onClick={(e) => e.stopPropagation()}>
              <Button
                variant={'destructive'}
                size={'icon-xs'}
                autoFocus
                onBlur={() => setIsDeleting(false)}
                onClick={deleteFsItem}
              >
                <Check />
              </Button>
              <Button variant={'outline'} size={'icon-xs'} onClick={() => setIsDeleting(false)}>
                <X />
              </Button>
            </ButtonGroup>
          ) : (
            <FsItemOptions
              createFolder={disableCreateFolder || isIgnored ? undefined : createFolder}
              createFile={disableCreateFile || isIgnored ? undefined : createFile}
              renameFsItem={disableRenaming || isIgnored ? undefined : startRenameFolder}
              deleteFsItem={disableDeleting ? undefined : startDeletingFolder}
              onTriggerFocus={() => {
                inputRef.current?.focus()
              }}
              isFolder={type === 'folder'}
              isIgnored={isIgnored}
            />
          )}
        </ItemActions>
      </Item>
      {newFsItem?.parent === itemPath && (
        <div className="ml-2 border-l pl-2">
          <NewFsItem inputRef={inputRef} />
        </div>
      )}
      {isFolderOpen(itemPath) && fs[itemPath] && fs[itemPath].length > 0 && (
        <div className="ml-2 flex flex-col gap-1 border-l pl-2">
          <FsTree fsItems={fs[itemPath]} />
        </div>
      )}
    </>
  )
}
