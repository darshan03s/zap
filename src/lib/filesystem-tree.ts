import type { DirectoryNode, FileSystemTree } from '@webcontainer/api'
import type { file } from '@/db/schema'

type ProjectFile = typeof file.$inferSelect

function ensureDirectory(tree: FileSystemTree, name: string): DirectoryNode {
  const entry = tree[name]

  if (entry && 'directory' in entry) {
    return entry
  }

  const directoryNode: DirectoryNode = { directory: {} }
  tree[name] = directoryNode

  return directoryNode
}

export function filesToFileSystemTree(files: ProjectFile[]): FileSystemTree {
  const tree: FileSystemTree = {}

  for (const projectFile of files) {
    const segments = projectFile.path.split('/')
    const name = segments.pop()

    if (!name) {
      continue
    }

    let current = tree

    for (const segment of segments) {
      const directoryNode = ensureDirectory(current, segment)
      current = directoryNode.directory
    }

    if (projectFile.type === 'directory') {
      ensureDirectory(current, name)
      continue
    }

    current[name] = {
      file: {
        contents: projectFile.content ?? ''
      }
    }
  }

  return tree
}
