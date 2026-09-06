'use client'

import Image from 'next/image'
import {
  ChatStatus,
  type DynamicToolUIPart,
  type ToolUIPart,
  UIMessage,
  getToolName,
  isToolUIPart
} from 'ai'
import 'streamdown/styles.css'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from './ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from './ai-elements/message'
import { Badge } from './ui/badge'

function HorizontalEllipsis() {
  return (
    <div className="flex items-center gap-1 text-zinc-500">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current animate-bounce"
          style={{
            animationDelay: `${i * 120}ms`
          }}
        />
      ))}
    </div>
  )
}

function ToolInvocationDisplay({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const toolName = getToolName(part)

  switch (part.state) {
    case 'output-available':
      return (
        <div className="font-mono text-xs">
          <Badge variant="default" className="h-6">
            Tool: {toolName}
          </Badge>
        </div>
      )
    case 'output-error':
      return (
        <div className="text-destructive text-xs">
          Tool: {toolName}
          <br />
          <pre>{JSON.stringify(part.errorText, null, 2)}</pre>
        </div>
      )
    default:
      return null
  }
}

export const ConversationComp = ({
  messages,
  status
}: {
  messages: UIMessage[]
  status: ChatStatus
}) => {
  return (
    <Conversation className="border rounded-lg">
      <ConversationContent>
        {messages.map((message) => (
          <Message from={message.role} key={message.id}>
            <MessageContent>
              {message.parts.map((part, i) => {
                if (isToolUIPart(part)) {
                  return <ToolInvocationDisplay key={`${message.id}-${i}`} part={part} />
                }

                switch (part.type) {
                  case 'file':
                    return (
                      <Image src={part.url} alt={part.filename ?? ''} width={100} height={100} />
                    )
                  case 'text':
                    return <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
                  default:
                    return null
                }
              })}
            </MessageContent>
          </Message>
        ))}
        {status === 'submitted' && <HorizontalEllipsis />}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
