import { RefObject } from 'react'
import { File, Folder } from 'lucide-react'
import { Item, ItemContent, ItemMedia } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { useFileSystem, useWebContainer } from '../hooks'
import { getParentFolder } from '../utils'
import { InputComp } from './input-comp'

export const NewFsItem = ({ inputRef }: { inputRef?: RefObject<HTMLInputElement | null> }) => {
  const { mkDir, writeFile } = useWebContainer()
  const { newFsItem, setNewFsItem } = useFileSystem()

  async function createNewFsItem(form: HTMLFormElement) {
    const formData = new FormData(form)
    const folderName = formData.get('folder-name')
    const fileName = formData.get('file-name')

    if (folderName && String(folderName).trim().length > 0) {
      const folderString = String(folderName)
      const path = newFsItem?.parent === '/' ? folderString : `${newFsItem?.parent}/${folderString}`
      await mkDir(path, { recursive: true })
      setNewFsItem(null)
    } else if (fileName) {
      const fileString = String(fileName)
      const path = newFsItem?.parent === '/' ? fileString : `${newFsItem?.parent}/${fileString}`
      const parent = getParentFolder(path)
      await mkDir(parent, { recursive: true })
      await writeFile(path, '')
      setNewFsItem(null)
    }
  }

  return (
    <Item
      size={'xs'}
      className={cn('ide-file-system-new-item m-0 h-6 min-h-6 cursor-pointer p-0 px-1 select-none')}
    >
      <ItemMedia>
        {newFsItem?.type === 'folder' ? <Folder className="size-3" /> : <File className="size-3" />}
      </ItemMedia>
      <ItemContent>
        <InputComp
          inputRef={inputRef}
          onSubmit={createNewFsItem}
          onBlur={() => setNewFsItem(null)}
          name={newFsItem?.type === 'folder' ? 'folder-name' : 'file-name'}
          placeholder={newFsItem?.type === 'folder' ? 'Enter folder name' : 'Enter file name'}
        />
      </ItemContent>
    </Item>
  )
}
