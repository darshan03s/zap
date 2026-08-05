import { apiKeyRepository } from '@/db/repository/apiKeyRepository'
import { withErrorHandler } from '@/lib/api-handler'
import { requireSession } from '@/lib/guards'

export const GET = withErrorHandler(async () => {
  const { userId } = await requireSession()

  const res = await apiKeyRepository.getByUserId(userId)

  return Response.json({ exists: res ? true : false })
})
