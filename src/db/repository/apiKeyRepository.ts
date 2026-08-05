import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { apiKey } from '@/db/schema'

export const apiKeyRepository = {
  findByUserId: (userId: string) => {
    return db.select().from(apiKey).where(eq(apiKey.userId, userId))
  },

  getByUserId: async (userId: string) => {
    const [result] = await db.select().from(apiKey).where(eq(apiKey.userId, userId)).limit(1)
    return result
  },

  updateByUserId: (userId: string, data: Partial<typeof apiKey.$inferInsert>) => {
    return db.update(apiKey).set(data).where(eq(apiKey.userId, userId)).returning()
  },

  deleteByUserId: (userId: string) => {
    return db.delete(apiKey).where(eq(apiKey.userId, userId)).returning()
  }
}
