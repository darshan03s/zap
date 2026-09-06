import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file } from '@/db/schema'
import { readBaseTemplateFiles } from '@/lib/base-template'

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
  }
}
