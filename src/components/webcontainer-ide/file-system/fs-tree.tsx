import { ReadDirEntry } from '../types'
import { FsItem } from './fs-item'

export const FsTree = ({ fsItems }: { fsItems: ReadDirEntry[] }) => {
  return (
    <>
      {fsItems.map((item) => (
        <FsItem key={item.path} item={item}></FsItem>
      ))}
    </>
  )
}
