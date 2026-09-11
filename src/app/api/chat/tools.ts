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

const writeFileInputSchema = z.object({
  path: z.string().describe('Path to the file to write.'),
  content: z.string().describe('Content to write to the file.')
})

const writeFileOutputSchema = z.object({
  path: z.string().optional(),
  created: z.boolean().optional(),
  error: z.string().optional()
})

const activeFilePathInputSchema = z.object({
  filepath: z.string().describe('Path to the file to focus in the user editor.')
})

const activeFilePathOutputSchema = z.object({
  path: z.string().optional(),
  error: z.string().optional()
})

const getLastCommandOutputInputSchema = z.object({})

const getLastCommandOutputOutputSchema = z.object({
  outputText: z.string().optional(),
})

const getTerminalOutputInputSchema = z.object({
  lastN: z.number().optional(),
})

const getTerminalOutputOutputSchema = z.object({
  outputText: z.string().optional(),
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
    }),
    writeFile: tool({
      description: 'Write content to a file at the given path. Creates the file if it does not exist.',
      inputSchema: writeFileInputSchema,
      outputSchema: writeFileOutputSchema,
      execute: async ({ path, content }) => {
        try {
          const result = await fileRepository.upsertFile(projectId, path, content)

          return {
            path: result.file.path,
            created: result.created
          }
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'Failed to write file'
          }
        }
      }
    }),
    activeFilePath: tool({
      description:
        'Focus the user editor on a file at the given path. Use this when you want the user to view a specific file, such as after creating or updating a component. Make sure the file path is correct',
      inputSchema: activeFilePathInputSchema,
      outputSchema: activeFilePathOutputSchema,
      execute: async ({ filepath }) => {
        const normalizedPath = filepath.trim()

        if (!normalizedPath) {
          return { error: 'Filepath is required' }
        }

        return { path: normalizedPath }
      }
    }),
    getLastCommandOutput: tool({
      description:
        'Get the last command executed in the terminal and its output. Use this to inspect build errors, dev server logs, or npm command results.',
      inputSchema: getLastCommandOutputInputSchema,
      outputSchema: getLastCommandOutputOutputSchema
    }),
    getTerminalOutput: tool({
      description:
        'Get the terminal output of last N lines. Use this to quickly inspect the terminal for logs, errors, or other information. Example: "Pass 10 to get the last 10 lines of terminal output."',
      inputSchema: getTerminalOutputInputSchema,
      outputSchema: getTerminalOutputOutputSchema
    }),
    startDevServer: tool({
      description:
        'Writed command in terminal to start the development server.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        status: z.string(),
      })
    })
  }
}
