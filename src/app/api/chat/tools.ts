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
    })
  }
}
