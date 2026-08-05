import { apiKeyRepository } from '@/db/repository/apiKeyRepository'
import { env } from '@/env'
import { withErrorHandler } from '@/lib/api-handler'
import { encrypt } from '@/lib/encryption'
import { ApiError } from '@/lib/errors'
import { requireSession } from '@/lib/guards'
import { CreateApiKeyRequest } from '@/lib/requests/api-key'

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await requireSession()

  const parsed = CreateApiKeyRequest.safeParse(await req.json())

  if (!parsed.success) {
    throw new ApiError('Bad request', 'BAD_REQUEST', 400)
  }

  const { provider, apiKey } = parsed.data

  const { iv, authTag, encrypted } = encrypt(apiKey)

  if (provider === 'default') {
    await apiKeyRepository.create({
      userId,
      provider: 'vercel_ai_gateway',
      apiKeyMode: 'free',
      key: env.AI_GATEWAY_API_KEY
    })
  } else {
    await apiKeyRepository.create({
      userId,
      provider,
      apiKeyMode: 'byok',
      key: `${iv}:${authTag}:${encrypted}`
    })
  }

  return Response.json({}, { status: 201 })
})
