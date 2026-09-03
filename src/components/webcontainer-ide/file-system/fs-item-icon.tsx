import { ChevronDown, ChevronRight, EyeOff, File } from 'lucide-react'

export function FsItemIcon({
  type,
  isIgnored,
  isFolderItemOpen
}: {
  type: 'folder' | 'file'
  isIgnored: boolean
  isFolderItemOpen: boolean
}) {
  if (isIgnored) return <EyeOff />

  if (type === 'file') {
    return <File />
  }

  return isFolderItemOpen ? <ChevronDown /> : <ChevronRight />
}
