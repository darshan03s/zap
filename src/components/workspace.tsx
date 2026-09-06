'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { UIMessage, useChat } from '@ai-sdk/react'
import { FileSystemTree } from '@webcontainer/api'
import 'streamdown/styles.css'
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
import { toast } from './ui/toast'
import { WebContainerIDE } from './webcontainer-ide'

const autoRespondedProjectIds = new Set<string>()

export function HorizontalEllipsis() {
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

export const Workspace = ({
  projectId,
  initialMessages,
  fileSystemTree
}: {
  projectId: string
  initialMessages: UIMessage[]
  fileSystemTree: FileSystemTree
}) => {
  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<Model>(MODELS[0])
  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    id: projectId,
    onError: (error) => {
      toast.add({
        title: 'Error',
        description: error.message
      })
    }
  })
  const hasAutoResponded = useRef(false)

  useEffect(() => {
    const savedModel = localStorage.getItem('model')
    if (!savedModel) return
    const foundModel = MODELS.find((m) => m.id === savedModel)
    if (foundModel) {
      setModel(foundModel)
    }
  }, [])

  useEffect(() => {
    const lastMessage = initialMessages.at(-1)
    if (
      lastMessage?.role !== 'user' ||
      hasAutoResponded.current ||
      autoRespondedProjectIds.has(projectId)
    ) {
      return
    }

    hasAutoResponded.current = true
    autoRespondedProjectIds.add(projectId)
    sendMessage(undefined, {
      body: {
        model: model.id,
        projectId
      }
    })
  }, [initialMessages, model.id, projectId, sendMessage])

  function handleSubmit(message: PromptInputMessage) {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)
    if (!(hasText || hasAttachments)) {
      return
    }
    sendMessage(
      { text: message.text, files: message.files ?? [] },
      {
        body: {
          model: model.id,
          userInput: message.text,
          projectId: projectId
        }
      }
    )
    setText('')
  }

  return (
    <Main className="flex gap-2 flex-1 max-h-(--main-full-height)">
      <div className="w-5/12 flex flex-col h-full gap-2 py-2 pl-2">
        <Conversation className="border rounded-lg">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'file':
                        return (
                          <Image
                            src={part.url}
                            alt={part.filename ?? ''}
                            width={100}
                            height={100}
                          />
                        )
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
            {status === 'submitted' && <HorizontalEllipsis />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInputComp
          status={status}
          handleSubmit={handleSubmit}
          text={text}
          onTextInputChange={(text) => setText(text)}
          model={model}
          onModelChange={(model) => {
            setModel(model)
            localStorage.setItem('model', model.id as string)
          }}
        />
      </div>

      <div className="flex-1 py-2 pr-2">
        <WebContainerIDE
          className="h-full"
          loadFromSnapshot={fileSystemTree}
          disableCreateFile
          disableCreateFolder
          disableDeleting
          disableMoving
          disableRenaming
          editorReadOnly
          terminalReadOnly
        />
      </div>
    </Main>
  )
}
