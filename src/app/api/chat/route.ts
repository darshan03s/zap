import { messagesRepository } from '@/db/repository/messageRepository';
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  LanguageModel,
} from 'ai';
import { GatewayRateLimitError } from '@ai-sdk/gateway'

function saveMessage(message: UIMessage, projectId: string) {
  messagesRepository.create({
    projectId: projectId,
    parts: message.parts,
    role: message.role,
  })
}

export async function POST(req: Request) {
  const { messages, model, projectId }: { messages: UIMessage[], model: LanguageModel, projectId: string } = await req.json();

  saveMessage(messages.at(-1)!, projectId)

  const result = streamText({
    model: model,
    messages: await convertToModelMessages(messages),
  });

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
