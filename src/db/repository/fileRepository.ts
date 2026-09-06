import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { file } from '@/db/schema'
import { readBaseTemplateFiles } from '@/lib/base-template'

export const fileRepository = {
  getAllByProjectId: (projectId: string) => {
    return db.select().from(file).where(eq(file.projectId, projectId))
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
