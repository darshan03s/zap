import { messagesRepository } from '@/db/repository/messageRepository'
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  LanguageModel,
  isStepCount,
  GatewayModelId
} from 'ai'
import { GatewayRateLimitError } from '@ai-sdk/gateway'
import { createChatTools } from './tools'
import { getSystemPrompt } from './system-prompt'
import { createGateway } from '@ai-sdk/gateway'
import { requireSession } from '@/lib/guards'
import { apiKeyRepository } from '@/db/repository/apiKeyRepository'
import { ApiError } from '@/lib/errors'
import { decrypt } from '@/lib/encryption'
import { env } from '@/env'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogle } from '@ai-sdk/google'
import { FREE_MODELS } from '@/constants'

function parseStoredKey(key: string) {
  const [iv, authTag, encrypted] = key.split(':')
  return decrypt({ iv, authTag, encrypted })
}

function saveMessage(message: UIMessage, projectId: string) {
  messagesRepository.create({
    projectId: projectId,
    parts: message.parts,
    role: message.role,
  })
}

function resolveModel(model: string, storedKeys: Awaited<ReturnType<typeof apiKeyRepository.getAllByUserId>>) {
  const [provider, modelName] = model.split('/')

  if (!provider || !modelName) {
    throw new ApiError('Invalid model', 'INVALID_MODEL', 400)
  }

  if (FREE_MODELS.some((m) => m.id === model)) {
    const gateway = createGateway({
      apiKey: env.AI_GATEWAY_API_KEY,
    })

    return gateway(model as GatewayModelId)
  }

  const providerKey = storedKeys.find(
    (key) =>
      key.provider === provider &&
      key.apiKeyMode === 'byok'
  )

  if (!providerKey) {
    throw new ApiError('API key not found', 'API_KEY_NOT_FOUND', 404)
  }

  const apiKey = parseStoredKey(providerKey.key)

  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })(modelName)

    case 'anthropic':
      return createAnthropic({ apiKey })(modelName)

    case 'google':
      return createGoogle({ apiKey })(modelName)

    default:
      throw new ApiError(
        `Unsupported provider: ${provider}`,
        'UNSUPPORTED_PROVIDER',
        400
      )
  }
}

export async function POST(req: Request) {
  const { userId } = await requireSession()
  const {
    messages,
    model,
    projectId,
    trigger,
    messageId
  }: {
    messages: UIMessage[]
    model: LanguageModel
    projectId: string
    trigger?: 'submit-message' | 'regenerate-message' | 'resume-stream'
    messageId?: string
  } = await req.json()

  const storedKeys = await apiKeyRepository.getAllByUserId(userId)
  if (!storedKeys) {
    throw new ApiError('API key not found', 'API_KEY_NOT_FOUND', 404)
  }

  const modelId = resolveModel(String(model), storedKeys)

  const lastMessage = messages.at(-1)!
  if (lastMessage.role === 'user' && trigger === 'submit-message' && messageId == null) {
    saveMessage(lastMessage, projectId)
  }

  const tools = createChatTools(projectId)

  const result = streamText({
    model: modelId,
    messages: await convertToModelMessages(messages, { tools }),
    tools,
    instructions: getSystemPrompt(),
    stopWhen: isStepCount(5)
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onEnd: (endObj) => {
        saveMessage(endObj.responseMessage, projectId)
      },
      onError: (error) => {
        if (error instanceof GatewayRateLimitError) {
          return 'Free tier requests on this model are rate-limited'
        }
        return "Something went wrong"
      }
    }),
  });
}
