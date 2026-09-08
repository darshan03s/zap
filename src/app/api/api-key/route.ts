import { apiKeyRepository } from '@/db/repository/apiKeyRepository'
import { generationLimitRepository } from '@/db/repository/generationLimitRepository'
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


  if (provider === 'default') {
    await apiKeyRepository.create({
      userId,
      provider: 'vercel_ai_gateway',
      apiKeyMode: 'free',
      key: 'free'
    })
  } else {
    const { iv, authTag, encrypted } = encrypt(apiKey)
    await apiKeyRepository.create({
      userId,
      provider,
      apiKeyMode: 'byok',
      key: `${iv}:${authTag}:${encrypted}`
    })
  }

  await generationLimitRepository.create(userId)

  return Response.json({}, { status: 201 })
})

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await requireSession()

  const apiKey = await apiKeyRepository.getAllByUserId(userId)

  const models = apiKey.map((key) => {
    return {
      provider: key.provider,
      apiKeyMode: key.apiKeyMode,
    }
  })

  return Response.json(models, { status: 200 })
})
