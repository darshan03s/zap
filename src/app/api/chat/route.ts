import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  LanguageModel,
} from 'ai';

function saveMessage(message: UIMessage) {
  console.log("Saving message", message);
}

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[], model: LanguageModel } = await req.json();

  saveMessage(messages.at(-1)!)

  const result = streamText({
    model: model,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream, onEnd: (endObj) => {
        saveMessage(endObj.responseMessage)
      }
    }),
  });
}
