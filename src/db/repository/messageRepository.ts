import { asc, eq } from "drizzle-orm"
import { db } from ".."
import { message } from "../schema"

export const messagesRepository = {
  create: async (newMessage: typeof message.$inferInsert) => {
    return await db.insert(message).values(newMessage).returning()
  },
  getAllByProjectId: async (projectId: string) => {
    return await db
      .select()
      .from(message)
      .where(eq(message.projectId, projectId))
      .orderBy(asc(message.createdAt))
  }
}
