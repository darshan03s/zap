'use client'

import { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react'
import {
  FileSystemAPI,
  FileSystemTree,
  LoadFilesOptions,
  SpawnOptions,
  WebContainer,
  WebContainerProcess
} from '@webcontainer/api'
import { IDisposable, Terminal } from '@xterm/xterm'
import { DEFAULT_ROOT_DIR, IGNORED_FS_EXTENSIONS_TO_DISPLAY } from '../constants'
import { ReadDirEntry } from '../types'
import { getExtension } from '../utils'

type Boot = () => Promise<WebContainer>

type Mount = (projectFiles: FileSystemTree, options?: LoadFilesOptions) => Promise<void>

type Spawn = (
  baseCommand: string,
  args: string[],
  options?: SpawnOptions,
  output?: { write: boolean; writeFn?: (data: string) => void }
) => Promise<{
  process: WebContainerProcess
  processExitCode: number
}>

type ReadFile = (
  ...args: Parameters<FileSystemAPI['readFile']>
) => ReturnType<FileSystemAPI['readFile']>

type WriteFile = (
  ...args: Parameters<FileSystemAPI['writeFile']>
) => ReturnType<FileSystemAPI['writeFile']>

type MkDir = (path: string, options?: { recursive: boolean }) => Promise<void>

type ReadDir = (
  path: Parameters<FileSystemAPI['readdir']>['0'],
  options: Parameters<FileSystemAPI['readdir']>['1'],
  foldersFirst?: boolean
) => Promise<ReadDirEntry[]>

type Rm = (...args: Parameters<FileSystemAPI['rm']>) => ReturnType<FileSystemAPI['rm']>

type Rename = (...args: Parameters<FileSystemAPI['rename']>) => ReturnType<FileSystemAPI['rename']>

type Mv = (source: string, destination: string) => Promise<void>

type LoadSnapshot = (snapshotUrl: string) => Promise<void>

type ActiveFile = {
  path: string
  content: string
}

type ActivePath = (path: string) => void

type SyncActiveFile = () => Promise<void>

type StartShell = (terminal: Terminal) => Promise<{
  shellProcess: WebContainerProcess
  inputWriter: WritableStreamDefaultWriter<string>
  iDisposable: IDisposable
}>

type ReadMedia = (path: string) => Promise<string>

type WebContainerContext = {
  wc: WebContainer | null
  boot: Boot
  mount: Mount
  spawn: Spawn
  readFile: ReadFile
  writeFile: WriteFile
  mkDir: MkDir
  readDir: ReadDir
  rm: Rm
  rename: Rename
  mv: Mv
  loadSnapshot: LoadSnapshot
  isMounted: boolean
  setIsMounted: Dispatch<SetStateAction<boolean>>
  rootDir: string
  activePath: ActivePath
  activeFile: ActiveFile
  startShell: StartShell
  serverUrl: string
  setServerUrl: Dispatch<SetStateAction<string>>
  shellProcessWriter: WritableStreamDefaultWriter<string> | null
  setShellProcessWriter: Dispatch<SetStateAction<WritableStreamDefaultWriter<string> | null>>
  readMedia: ReadMedia
  syncActiveFile: SyncActiveFile
}

export const WebContainerContext = createContext<WebContainerContext | undefined>(undefined)

export const WebContainerProvider = ({
  children,
  rootDir = DEFAULT_ROOT_DIR
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  const [wc, setWc] = useState<WebContainer | null>(null)
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [activeFile, setActiveFile] = useState<ActiveFile>({
    path: '',
    content: ''
  })

  const [serverUrl, setServerUrl] = useState<string>('')
  const [shellProcessWriter, setShellProcessWriter] =
    useState<WritableStreamDefaultWriter<string> | null>(null)

  useEffect(() => {
    if (!wc) return

    function serverReady(_port: number, url: string) {
      setServerUrl(url)
    }

    const unSubscribeServerReady = wc.on('server-ready', serverReady)

    return () => {
      unSubscribeServerReady()
    }
  }, [wc])

  function requireWc(): WebContainer {
    if (!wc) {
      throw new Error('WebContainer is not initialized. Call boot() first.')
    }

    return wc
  }

  const boot: Boot = async () => {
    if (wc) return wc
    const webContainerInstance = await WebContainer.boot({ workdirName: rootDir })
    setWc(webContainerInstance)
    return webContainerInstance
  }

  useEffect(() => {
    boot()
    return () => wc?.teardown()
  }, [wc])

  const mount: Mount = async (projectFiles, options) => {
    const wc = requireWc()
    await wc.mount(projectFiles, options)
    setIsMounted(true)
  }

  const spawn: Spawn = async (baseCommand, args, options, output) => {
    const wc = requireWc()
    const process = await wc.spawn(baseCommand, args, options)

    const outputPromise = output?.write
      ? process.output.pipeTo(
          new WritableStream({
            write(data) {
              output.writeFn?.(data)
            }
          })
        )
      : Promise.resolve()

    const processExitCode = await process.exit
    await outputPromise

    return {
      process,
      processExitCode
    }
  }

  const readFile: ReadFile = async (path, encoding = 'utf-8') => {
    const wc = requireWc()
    const fileContent = await wc.fs.readFile(path, encoding)
    return fileContent
  }

  const writeFile: WriteFile = async (path, data, options) => {
    const wc = requireWc()
    return await wc.fs.writeFile(path, data, options)
  }

  const mkDir: MkDir = async (folderPath, options?) => {
    const wc = requireWc()
    if (options) {
      if (options.recursive) {
        await wc.fs.mkdir(folderPath, {
          recursive: true
        })
      } else {
        await wc.fs.mkdir(folderPath)
      }
    }
  }

  const readDir: ReadDir = async (path, options, foldersFirst = false) => {
    const wc = requireWc()
    const items = await wc.fs.readdir(path, options)
    const itemsWithPath = items.map((item) => ({
      path: path === '/' ? `${item.name}` : `${path}/${item.name}`,
      name: item.name,
      isFile: () => item.isFile(),
      isDirectory: () => item.isDirectory()
    }))
    if (foldersFirst) {
      const folders = itemsWithPath.filter((i) => i.isDirectory())
      const files = itemsWithPath.filter((i) => i.isFile())
      return [...folders, ...files]
    }
    return itemsWithPath
  }

  const rm: Rm = async (path, options) => {
    const wc = requireWc()
    return await wc.fs.rm(path, options)
  }

  const rename: Rename = async (oldPath, newPath) => {
    const wc = requireWc()
    return await wc.fs.rename(oldPath, newPath)
  }

  const mv: Mv = async (source, destination) => {
    const dest = destination === '/' ? '' : destination
    await spawn('mv', [source, dest])
  }

  const loadSnapshot: LoadSnapshot = async (snapshotUrl: string) => {
    const wc = requireWc()

    const snapshotResponse = await fetch(snapshotUrl)
    const snapshot = await snapshotResponse.arrayBuffer()

    await wc.mount(snapshot)
    setIsMounted(true)
  }

  const activePath = async (path: string) => {
    if (path === '') {
      setActiveFile({
        path: '',
        content: ''
      })
      return
    }

    const ext = getExtension(path)

    if (IGNORED_FS_EXTENSIONS_TO_DISPLAY.includes(ext)) {
      setActiveFile({
        path,
        content: `Content cannot be displayed for .${ext}`
      })
      return
    }

    const content = await readFile(path, 'utf-8')
    setActiveFile({
      path,
      content
    })
  }

  const syncActiveFile = async () => {
    const content = await readFile(activeFile.path, 'utf-8')
    setActiveFile((prev) => ({
      ...prev,
      content
    }))
  }

  const startShell: StartShell = async (terminal) => {
    const wc = requireWc()
    const shellProcess = await wc.spawn(`jsh`, {
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows
      }
    })
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data)
        }
      })
    )

    const inputWriter = shellProcess.input.getWriter()
    const iDisposable = terminal.onData((data) => {
      inputWriter.write(data)
    })

    return { shellProcess, inputWriter, iDisposable }
  }

  const readMedia: ReadMedia = async (path) => {
    const wc = requireWc()

    const bytes = await wc.fs.readFile(path)

    const copy = new Uint8Array(bytes)

    const blob = new Blob([copy])
    return URL.createObjectURL(blob)
  }

  return (
    <WebContainerContext.Provider
      value={{
        boot,
        wc,
        mount,
        spawn,
        readFile,
        writeFile,
        mkDir,
        readDir,
        rm,
        rename,
        mv,
        loadSnapshot,
        isMounted,
        setIsMounted,
        rootDir,
        activePath,
        syncActiveFile,
        activeFile,
        startShell,
        serverUrl,
        setServerUrl,
        shellProcessWriter,
        setShellProcessWriter,
        readMedia
      }}
    >
      {children}
    </WebContainerContext.Provider>
  )
}
