import { projectRepository } from '@/db/repository/projectRepository'
import { withErrorHandler } from '@/lib/api-handler'
import { requireSession } from '@/lib/guards'

export const GET = withErrorHandler(async () => {
  const { userId } = await requireSession()

  const projects = await projectRepository.getByUserId(userId)

  return Response.json({ projects })
})
