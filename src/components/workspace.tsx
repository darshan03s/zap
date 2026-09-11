'use client'

import { useEffect, useRef, useState } from 'react'
import { UIMessage, useChat } from '@ai-sdk/react'
import { FileSystemTree } from '@webcontainer/api'
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useTheme } from 'next-themes'
import { useModelStore } from '@/stores/model-store'
import { PromptInputMessage } from './ai-elements/prompt-input'
import { ConversationComp } from './conversation-comp'
import { Main } from './main'
import { PromptInputComp } from './prompt-input-comp'
import { toast } from './ui/toast'
import { WebContainerIDE, useTerminal, useWebContainer } from './webcontainer-ide'

const autoRespondedProjectIds = new Set<string>()

export const Workspace = ({
  projectId,
  initialMessages,
  fileSystemTree
}: {
  projectId: string
  initialMessages: UIMessage[]
  fileSystemTree: FileSystemTree | string
}) => {
  const [text, setText] = useState<string>('')
  const { model, setModel } = useModelStore()
  const { writeFile, activePath, syncActiveFile, isMounted } = useWebContainer()
  const { getTerminalOutput, startDevServer, isTerminalStarted } = useTerminal()
  const { resolvedTheme } = useTheme()
  const { messages, sendMessage, status, addToolOutput } = useChat({
    messages: initialMessages,
    id: projectId,
    onError: (error) => {
      toast.add({
        title: 'Error',
        description: error.message
      })
    },
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      const toolName = toolCall.toolName
      const toolInput = toolCall.input as {
        path: string
        content: string
        filepath: string
        lastN: number
      }
      if (toolName === 'writeFile') {
        writeFile(toolInput.path, toolInput.content).then(() => {
          void syncActiveFile()
        })
      }
      if (toolName === 'activeFilePath') {
        void activePath(toolInput.filepath)
      }
      if (toolName === 'getLastCommandOutput') {
        const { text } = getTerminalOutput(undefined, true)
        addToolOutput({
          tool: 'getLastCommandOutput',
          toolCallId: toolCall.toolCallId,
          output: { outputText: text }
        })
      }
      if (toolName === 'getTerminalOutput') {
        const { text } = getTerminalOutput(toolInput.lastN)
        addToolOutput({
          tool: 'getTerminalOutput',
          toolCallId: toolCall.toolCallId,
          output: { outputText: text }
        })
      }
      if (toolName === 'startDevServer') {
        try {
          startDevServer()
          addToolOutput({
            tool: 'startDevServer',
            toolCallId: toolCall.toolCallId,
            output: { status: 'command fired to start development server' }
          })
        } catch (error) {
          addToolOutput({
            tool: 'startDevServer',
            toolCallId: toolCall.toolCallId,
            output: { status: (error as Error).message }
          })
        }
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

  useEffect(() => {
    if (!isMounted || !isTerminalStarted) return

    const timeout = setTimeout(() => {
      startDevServer()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isMounted, startDevServer, isTerminalStarted])

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
          openTerminal
          editorTheme={resolvedTheme as 'light' | 'dark'}
        />
      </div>
    </Main>
  )
}
