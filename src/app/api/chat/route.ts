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
import { logger } from '@/lib/logger'

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

  const storedKey = await apiKeyRepository.getByUserId(userId)
  if (!storedKey) {
    throw new ApiError('API key not found', 'API_KEY_NOT_FOUND', 404)
  }

  const apiKey = storedKey.key === 'free' ? env.AI_GATEWAY_API_KEY : parseStoredKey(storedKey.key)

  let modelId;

  if (storedKey.provider === 'openai' && storedKey.apiKeyMode === 'byok') {
    const gateway = createOpenAI({ apiKey: apiKey })
    modelId = gateway(model.toString().replace('openai/', ''))
  } else if (storedKey.provider === 'anthropic' && storedKey.apiKeyMode === 'byok') {
    const gateway = createAnthropic({ apiKey: apiKey })
    modelId = gateway(model.toString().replace('anthropic/', ''))
  }
  else if (storedKey.provider === 'google' && storedKey.apiKeyMode === 'byok') {
    const gateway = createGoogle({ apiKey: apiKey })
    modelId = gateway(model.toString().replace('google/', ''))
  }
  else {
    const gateway = createGateway({ apiKey: apiKey })
    modelId = gateway(model as GatewayModelId)
  }

  logger.info(`Using provider: ${storedKey.provider}, model: ${modelId}, mode: ${storedKey.apiKeyMode}`)

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
