import { WebContainer } from '@webcontainer/api'
import { ITheme } from '@xterm/xterm'

export type WebContainerIDEProps = {
  className?: string
  /**
   * Initial filesystem to mount into the WebContainer.
   *
   * Accepts one of:
   * - A URL pointing to a WebContainer snapshot.
   * - A `FileSystemTree`.
   * - A WebContainer snapshot as an `ArrayBuffer` or `Uint8Array`.
   */
  loadFromSnapshot?: Parameters<WebContainer['mount']>['0'] | string
  /**
   * Application theme
   */
  editorTheme?: 'light' | 'dark'
  /**
   * Prevents editing the file content.
   */
  editorReadOnly?: boolean
  /**
   * Prevents user input in the terminal.
   */
  terminalReadOnly?: boolean
  /**
   * Hides the terminal UI without preventing the shell from starting.
   */
  hideTerminal?: boolean
  /**
   * Disables folder creation in the UI.
   */
  disableCreateFolder?: boolean
  /**
   * Disables file creation in the UI.
   */
  disableCreateFile?: boolean
  /**
   * Disables file and folder renaming in the UI
   */
  disableRenaming?: boolean
  /**
   * Disables file and folder deleting in the UI
   */
  disableDeleting?: boolean
  /**
   * Disables file and folder moving in the UI
   */
  disableMoving?: boolean
  /**
   * Opens terminal on load
   */
  openTerminal?: boolean
  /**
   * Called after a rename event from the WebContainer file system.
   */
  onRenameEvent?: (fsItem: string) => void

  /**
   * Called after a change event from the WebContainer file system.
   */
  onChangeEvent?: (fsItem: string) => void
  /**
   * Sets terminal theme
   */
  terminalTheme?: ITheme
}

export type ReadDirEntry = {
  path: string
  name: string
  isFile(): boolean
  isDirectory(): boolean
}

export type FsItemDrag = {
  name: string
  path: string
  type: 'file' | 'folder'
}
