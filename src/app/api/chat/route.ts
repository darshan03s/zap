import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  LanguageModel,
} from 'ai';

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[], model: LanguageModel } = await req.json();

  const result = streamText({
    model: model,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
