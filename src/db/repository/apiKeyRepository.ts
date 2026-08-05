import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { apiKey } from '@/db/schema'

export const apiKeyRepository = {
  create: (data: typeof apiKey.$inferInsert) => {
    return db
      .insert(apiKey)
      .values(data)
      .onConflictDoUpdate({
        target: [apiKey.userId, apiKey.provider],
        set: { key: data.key, apiKeyMode: data.apiKeyMode }
      })
      .returning()
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
