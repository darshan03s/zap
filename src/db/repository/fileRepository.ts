import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file } from '@/db/schema'
import { readBaseTemplateFiles } from '@/lib/base-template'

type ProjectFile = typeof file.$inferSelect

async function ensureDirectoryPath(projectId: string, dirPath: string): Promise<ProjectFile> {
  const [existing] = await db
    .select()
    .from(file)
    .where(and(eq(file.projectId, projectId), eq(file.path, dirPath)))
    .limit(1)

  if (existing) {
    if (existing.type !== 'directory') {
      throw new Error(`Not a directory: ${dirPath}`)
    }

    return existing
  }

  const segments = dirPath.split('/')
  const name = segments.pop()

  if (!name) {
    throw new Error(`Invalid directory path: ${dirPath}`)
  }

  const parentPath = segments.length > 0 ? segments.join('/') : null
  const parent = parentPath ? await ensureDirectoryPath(projectId, parentPath) : null

  const [createdDirectory] = await db
    .insert(file)
    .values({
      projectId,
      name,
      path: dirPath,
      parentId: parent?.id ?? null,
      type: 'directory',
      content: null
    })
    .returning()

  return createdDirectory
}

export const fileRepository = {
  getAllByProjectId: (projectId: string) => {
    return db.select().from(file).where(eq(file.projectId, projectId))
  },

  getByPath: async (projectId: string, path: string) => {
    const [result] = await db
      .select()
      .from(file)
      .where(and(eq(file.projectId, projectId), eq(file.path, path)))
      .limit(1)

    return result
  },

  listByParentId: (projectId: string, parentId: string | null) => {
    const conditions = parentId === null
      ? and(eq(file.projectId, projectId), isNull(file.parentId))
      : and(eq(file.projectId, projectId), eq(file.parentId, parentId))

    return db
      .select({
        name: file.name,
        path: file.path,
        type: file.type
      })
      .from(file)
      .where(conditions)
  },

  seedFromBaseTemplate: async (projectId: string) => {
    const templateFiles = await readBaseTemplateFiles()
    const pathToId = new Map<string, string>()
    const createdFiles: (typeof file.$inferSelect)[] = []

    for (const templateFile of templateFiles) {
      const parentId = templateFile.parentPath
        ? pathToId.get(templateFile.parentPath) ?? null
        : null

      const [createdFile] = await db
        .insert(file)
        .values({
          projectId,
          name: templateFile.name,
          path: templateFile.path,
          parentId,
          type: templateFile.type,
          content: templateFile.content
        })
        .returning()

      pathToId.set(templateFile.path, createdFile.id)
      createdFiles.push(createdFile)
    }

    return createdFiles
  },

  upsertFile: async (projectId: string, filePath: string, content: string) => {
    const normalizedPath = filePath.trim()

    if (!normalizedPath) {
      throw new Error('Path is required')
    }

    const segments = normalizedPath.split('/')
    const name = segments.pop()

    if (!name) {
      throw new Error(`Invalid file path: ${normalizedPath}`)
    }

    const parentPath = segments.length > 0 ? segments.join('/') : null
    const parent = parentPath ? await ensureDirectoryPath(projectId, parentPath) : null
    const existing = await fileRepository.getByPath(projectId, normalizedPath)

    if (existing) {
      if (existing.type !== 'file') {
        throw new Error(`Not a file: ${normalizedPath}`)
      }

      const [updatedFile] = await db
        .update(file)
        .set({ content })
        .where(eq(file.id, existing.id))
        .returning()

      return { file: updatedFile, created: false }
    }

    const [createdFile] = await db
      .insert(file)
      .values({
        projectId,
        name,
        path: normalizedPath,
        parentId: parent?.id ?? null,
        type: 'file',
        content
      })
      .returning()

    return { file: createdFile, created: true }
  }
}
