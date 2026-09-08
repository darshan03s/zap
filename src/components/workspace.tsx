'use client'

import { useEffect, useRef, useState } from 'react'
import { UIMessage, useChat } from '@ai-sdk/react'
import { FileSystemTree } from '@webcontainer/api'
import { useTheme } from 'next-themes'
import { useModelStore } from '@/stores/model-store'
import { PromptInputMessage } from './ai-elements/prompt-input'
import { ConversationComp } from './conversation-comp'
import { Main } from './main'
import { PromptInputComp } from './prompt-input-comp'
import { toast } from './ui/toast'
import { WebContainerIDE, useWebContainer } from './webcontainer-ide'

const autoRespondedProjectIds = new Set<string>()

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
  const { model, setModel } = useModelStore()
  const { writeFile } = useWebContainer()
  const { resolvedTheme } = useTheme()
  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    id: projectId,
    onError: (error) => {
      toast.add({
        title: 'Error',
        description: error.message
      })
    },
    onToolCall: (toolCallObj) => {
      const toolName = toolCallObj.toolCall.toolName
      const tooInput = toolCallObj.toolCall.input as { path: string; content: string }
      if (toolName === 'writeFile') {
        writeFile(tooInput.path, tooInput.content)
      }
    }
  })
  const hasAutoResponded = useRef(false)

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
    <Main className="grid grid-cols-3 gap-2">
      <div className="max-h-(--main-full-height) min-h-(--main-full-height) col-span-1 flex flex-col h-full gap-2 py-2 pl-2">
        <ConversationComp messages={messages} status={status} />
        <PromptInputComp
          status={status}
          handleSubmit={handleSubmit}
          text={text}
          onTextInputChange={(text) => setText(text)}
          model={model}
          onModelChange={(model) => {
            setModel(model)
          }}
        />
      </div>

      <div className="max-h-(--main-full-height) min-h-(--main-full-height) col-span-2 py-2 pr-2">
        <WebContainerIDE
          className="h-full"
          loadFromSnapshot={fileSystemTree}
          disableCreateFile
          disableCreateFolder
          disableDeleting
          disableMoving
          disableRenaming
          editorReadOnly
          terminalReadOnly={process.env.NODE_ENV === 'production'}
          editorTheme={resolvedTheme as 'light' | 'dark'}
        />
      </div>
    </Main>
  )
}
