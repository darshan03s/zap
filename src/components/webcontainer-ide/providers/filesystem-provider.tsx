'use client'

import { Dispatch, RefObject, SetStateAction, createContext, useRef, useState } from 'react'
import { IGNORED_FOLDERS } from '../constants'
import { useIde, useWebContainer } from '../hooks'
import { FsItemDrag, ReadDirEntry } from '../types'
import { getParentFolder } from '../utils'

type Fs = Record<string, ReadDirEntry[]>

type NewFsItem = {
  parent: string
  type: 'folder' | 'file'
}

type ToggleFileSystem = () => void

type LoadFolderItems = (path: string) => Promise<void>

type HandleFsItemClick = (item: ReadDirEntry, open?: true) => Promise<void>

type IsFolderOpen = (path: string) => boolean

type CollapseAllFolders = () => void

type IsIgnoredPath = (path: string) => boolean

type OpenFolder = (path: string) => Promise<void>

type CloseFolder = (path: string) => void

type ClearFolder = (path: string) => void

type HandleFsItemDrop = (source: FsItemDrag, destination: string) => Promise<void>

type StartFsItemMove = (item: FsItemDrag) => void

type EndFsItemMove = () => void

type FileSystemContextType = {
  fileSystemOpen: boolean
  setFileSystemOpen: Dispatch<SetStateAction<boolean>>
  toggleFileSystem: ToggleFileSystem
  fs: Fs
  setFs: Dispatch<SetStateAction<Fs>>
  loadFolderItems: LoadFolderItems
  handleFsItemClick: HandleFsItemClick
  isFolderOpen: IsFolderOpen
  newFsItem: NewFsItem | null
  setNewFsItem: Dispatch<SetStateAction<NewFsItem | null>>
  collapseAllFolders: CollapseAllFolders
  isIgnoredPath: IsIgnoredPath
  hoveredPath: string | null
  setHoveredPath: Dispatch<SetStateAction<string | null>>
  draggedItem: RefObject<FsItemDrag | null>
  openFolder: OpenFolder
  closeFolder: CloseFolder
  clearFolder: ClearFolder
  handleFsItemDrop: HandleFsItemDrop
  startFsItemMove: StartFsItemMove
  endFsItemMove: EndFsItemMove
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const { readDir, activePath, mv, activeFile } = useWebContainer()
  const { setView } = useIde()
  const [fileSystemOpen, setFileSystemOpen] = useState(true)
  const [fs, setFs] = useState<Fs>({})
  const [openFolders, setOpenFolders] = useState(new Set<string>())
  const [newFsItem, setNewFsItem] = useState<NewFsItem | null>(null)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const draggedItem = useRef<FsItemDrag | null>(null)

  const toggleFileSystem: ToggleFileSystem = () => {
    setFileSystemOpen(!fileSystemOpen)
  }

  const toggleFolderOpen = (folderPath: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)

      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }

      return next
    })
  }

  const isFolderOpen: IsFolderOpen = (path) => {
    return openFolders.has(path)
  }

  const loadFolderItems: LoadFolderItems = async (path) => {
    if (isIgnoredPath(path)) return
    try {
      const items = await readDir(
        path,
        {
          withFileTypes: true
        },
        true
      )
      setFs((prev) => ({
        ...prev,
        [path]: items
      }))
    } catch {}
  }

  const handleFsItemClick: HandleFsItemClick = async (item, open) => {
    const folderPath = item.path
    if (item.isDirectory()) {
      if (!fs[folderPath] || fs[folderPath].length === 0) {
        await loadFolderItems(folderPath)
      }
      if (open) {
        setOpenFolders((prev) => {
          const next = new Set(prev)
          next.add(folderPath)
          return next
        })
      } else {
        toggleFolderOpen(folderPath)
      }
    } else if (item.isFile()) {
      activePath(item.path)
      setView('editor')
    }
  }

  const collapseAllFolders: CollapseAllFolders = () => {
    setOpenFolders(new Set())
  }

  const openFolder: OpenFolder = async (path) => {
    await loadFolderItems(path)
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.add(path)
      return next
    })
  }

  const closeFolder: CloseFolder = (path) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.delete(path)
      return next
    })
  }

  const clearFolder: ClearFolder = (path) => {
    closeFolder(path)
    if (fs[path]) {
      setFs((prev) => {
        const { [path]: _, ...rest } = prev
        return rest
      })
    }
  }

  const isIgnoredPath: IsIgnoredPath = (path) => {
    return path.split('/').some((segment) => IGNORED_FOLDERS.has(segment))
  }

  const startFsItemMove: StartFsItemMove = (item) => {
    draggedItem.current = item
  }

  const endFsItemMove: EndFsItemMove = () => {
    draggedItem.current = null
    setHoveredPath(null)
  }

  const handleFsItemDrop: HandleFsItemDrop = async (source, destination) => {
    const parent = getParentFolder(source.path)
    if (parent === destination) return
    await mv(source.path, destination)
    const newPath = destination === '/' ? source.name : `${destination}/${source.name}`
    if (source.type === 'file' && activeFile.path === source.path) {
      activePath(newPath)
    }
    if (source.type === 'folder') {
      clearFolder(source.path)
      if (activeFile.path.startsWith(source.path + '/')) {
        activePath(activeFile.path.replace(source.path, newPath))
      }
    }
  }

  return (
    <FileSystemContext.Provider
      value={{
        fileSystemOpen,
        setFileSystemOpen,
        toggleFileSystem,
        fs,
        setFs,
        loadFolderItems,
        handleFsItemClick,
        isFolderOpen,
        newFsItem,
        setNewFsItem,
        collapseAllFolders,
        isIgnoredPath,
        hoveredPath,
        setHoveredPath,
        draggedItem,
        openFolder,
        closeFolder,
        handleFsItemDrop,
        startFsItemMove,
        endFsItemMove,
        clearFolder
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
