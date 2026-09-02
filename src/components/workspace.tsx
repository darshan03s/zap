'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { MODELS } from '@/constants'
import { Model } from '@/types'
import { PromptInputMessage } from './ai-elements/prompt-input'
import { Main } from './main'
import { PromptInputComp } from './prompt-input-comp'

export const Workspace = () => {
  const { messages, sendMessage, status } = useChat()
  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<Model>(MODELS[0])

  function handleSubmit(message: PromptInputMessage) {
    sendMessage(
      { text: message.text },
      {
        body: {
          model: model.id,
          userInput: message.text
        }
      }
    )
    setText('')
  }

  return (
    <Main className="grid grid-cols-12 gap-2 flex-1">
      <div className="col-span-5 flex flex-col gap-2 px-3">
        <Conversation className="border-2 flex flex-col max-h-122 min-h-127 rounded-lg">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
                        )
                      default:
                        return null
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInputComp
          status={status}
          handleSubmit={handleSubmit}
          text={text}
          onTextInputChange={(text) => setText(text)}
          model={model}
          onModelChange={(model) => setModel(model)}
        />
      </div>

      <div className="col-span-8"></div>
    </Main>
  )
}
