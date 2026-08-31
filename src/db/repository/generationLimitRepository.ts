import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { generationLimit } from '@/db/schema'

export const generationLimitRepository = {
  create: (userId: string) => {
    return db
      .insert(generationLimit)
      .values({ userId, generationCount: 0 })
      .onConflictDoUpdate({
        target: [generationLimit.userId],
        set: { generationCount: 0 }
      })
      .returning()
  },

  getByUserId: async (userId: string) => {
    const [result] = await db
      .select()
      .from(generationLimit)
      .where(eq(generationLimit.userId, userId))
      .limit(1)
    return result
  }
}
