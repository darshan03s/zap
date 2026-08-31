import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { project } from '@/db/schema'

export const projectRepository = {
  create: (data: typeof project.$inferInsert) => {
    return db.insert(project).values(data).returning()
  },

  getById: async (id: string) => {
    const [result] = await db.select().from(project).where(eq(project.id, id)).limit(1)
    return result
  },

  getByUserId: (userId: string) => {
    return db.select().from(project).where(eq(project.userId, userId))
  },

  updateById: (id: string, userId: string, data: Partial<typeof project.$inferInsert>) => {
    return db
      .update(project)
      .set(data)
      .where(and(eq(project.id, id), eq(project.userId, userId)))
      .returning()
  },

  deleteById: (id: string, userId: string) => {
    return db
      .delete(project)
      .where(and(eq(project.id, id), eq(project.userId, userId)))
      .returning()
  }
}
