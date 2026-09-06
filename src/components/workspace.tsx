'use client'

import { useEffect, useRef, useState } from 'react'
import { UIMessage, useChat } from '@ai-sdk/react'
import { FileSystemTree } from '@webcontainer/api'
import { MODELS } from '@/constants'
import { Model } from '@/types'
import { PromptInputMessage } from './ai-elements/prompt-input'
import { ConversationComp } from './conversation-comp'
import { Main } from './main'
import { PromptInputComp } from './prompt-input-comp'
import { toast } from './ui/toast'
import { WebContainerIDE } from './webcontainer-ide'

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
      <div className="w-4/12 flex flex-col h-full gap-2 py-2 pl-2">
        <ConversationComp messages={messages} status={status} />
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
