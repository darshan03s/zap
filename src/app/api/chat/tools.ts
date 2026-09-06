import { tool } from 'ai'
import { z } from 'zod'
import { fileRepository } from '@/db/repository/fileRepository'

const lsEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory'])
})

const lsInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Path to list. Omit or pass an empty string for the root directory.')
})

const lsOutputSchema = z.object({
  entries: z.array(lsEntrySchema).optional(),
  error: z.string().optional()
})

const readFileInputSchema = z.object({
  filepath: z.string().describe('Path to the file to read.')
})

const readFileOutputSchema = z.object({
  path: z.string().optional(),
  content: z.string().optional(),
  error: z.string().optional()
})

const getFileTreeInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe('Folder path to render as a tree. Omit or pass an empty string for the root directory.')
})

const getFileTreeOutputSchema = z.object({
  path: z.string().optional(),
  tree: z.string().optional(),
  error: z.string().optional()
})

type FileTreeEntry = {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  parentId: string | null
}

function buildChildrenMap(files: FileTreeEntry[]) {
  const children = new Map<string | null, FileTreeEntry[]>()

  for (const file of files) {
    const siblings = children.get(file.parentId) ?? []
    siblings.push(file)
    children.set(file.parentId, siblings)
  }

  for (const siblings of children.values()) {
    siblings.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }

      return a.name.localeCompare(b.name)
    })
  }

  return children
}

function renderAsciiChildren(
  parentId: string | null,
  prefix: string,
  lines: string[],
  childrenMap: Map<string | null, FileTreeEntry[]>
) {
  const children = childrenMap.get(parentId) ?? []

  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    const isLast = index === children.length - 1
    const connector = isLast ? '└── ' : '├── '
    const displayName = child.type === 'directory' ? `${child.name}/` : child.name

    lines.push(`${prefix}${connector}${displayName}`)

    if (child.type === 'directory') {
      renderAsciiChildren(child.id, prefix + (isLast ? '    ' : '│   '), lines, childrenMap)
    }
  }
}

function renderAsciiFileTree(root: FileTreeEntry | null, childrenMap: Map<string | null, FileTreeEntry[]>) {
  const lines: string[] = [root ? `${root.name}/` : '.']

  renderAsciiChildren(root?.id ?? null, '', lines, childrenMap)

  return lines.join('\n')
}

export function createChatTools(projectId: string) {
  return {
    ls: tool({
      description:
        'List files and directories at a path in the project filesystem. Omit path to list the root directory.',
      inputSchema: lsInputSchema,
      outputSchema: lsOutputSchema,
      execute: async ({ path }) => {
        const normalizedPath = path?.trim() || null

        if (!normalizedPath) {
          const entries = await fileRepository.listByParentId(projectId, null)
          return { entries }
        }

        const parent = await fileRepository.getByPath(projectId, normalizedPath)

        if (!parent) {
          return { error: `Path not found: ${normalizedPath}` }
        }

        if (parent.type !== 'directory') {
          return { error: `Not a directory: ${normalizedPath}` }
        }

        const entries = await fileRepository.listByParentId(projectId, parent.id)
        return { entries }
      }
    }),
    readFile: tool({
      description: 'Read the content of a file at the given path in the project filesystem.',
      inputSchema: readFileInputSchema,
      outputSchema: readFileOutputSchema,
      execute: async ({ filepath }) => {
        const normalizedPath = filepath.trim()

        if (!normalizedPath) {
          return { error: 'Filepath is required' }
        }

        const fileEntry = await fileRepository.getByPath(projectId, normalizedPath)

        if (!fileEntry) {
          return { error: `File not found: ${normalizedPath}` }
        }

        if (fileEntry.type !== 'file') {
          return { error: `Not a file: ${normalizedPath}` }
        }

        return {
          path: fileEntry.path,
          content: fileEntry.content ?? ''
        }
      }
    }),
    getFileTree: tool({
      description:
        'Get an ASCII file tree representation of a folder in the project filesystem. Omit path for the root directory.',
      inputSchema: getFileTreeInputSchema,
      outputSchema: getFileTreeOutputSchema,
      execute: async ({ path }) => {
        const normalizedPath = path?.trim() || null
        const files = await fileRepository.getAllByProjectId(projectId)
        const childrenMap = buildChildrenMap(files)

        if (!normalizedPath) {
          return {
            path: '.',
            tree: renderAsciiFileTree(null, childrenMap)
          }
        }

        const folder = await fileRepository.getByPath(projectId, normalizedPath)

        if (!folder) {
          return { error: `Path not found: ${normalizedPath}` }
        }

        if (folder.type !== 'directory') {
          return { error: `Not a directory: ${normalizedPath}` }
        }

        return {
          path: folder.path,
          tree: renderAsciiFileTree(folder, childrenMap)
        }
      }
    })
  }
}
