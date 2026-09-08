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

  const gateway = createGateway({ apiKey: apiKey })

  const lastMessage = messages.at(-1)!
  if (lastMessage.role === 'user' && trigger === 'submit-message' && messageId == null) {
    saveMessage(lastMessage, projectId)
  }

  const tools = createChatTools(projectId)

  const result = streamText({
    model: gateway(model as GatewayModelId),
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
