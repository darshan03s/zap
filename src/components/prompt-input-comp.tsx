'use client'

import { memo, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments
} from '@/components/ai-elements/attachments'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments
} from '@/components/ai-elements/prompt-input'
import { MODELS } from '@/constants'
import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { logger } from '@/lib/logger'
import { createProject as createProjectRequest } from '@/lib/requests/project'
import { Model } from '@/types'
import { ApiKeyModal } from './api-key-modal'
import { toast } from './ui/toast'

interface AttachmentItemProps {
  attachment: {
    id: string
    type: 'file'
    filename?: string
    mediaType: string
    url: string
  }
  onRemove: (id: string) => void
}

const AttachmentItem = memo(({ attachment, onRemove }: AttachmentItemProps) => {
  const handleRemove = useCallback(() => onRemove(attachment.id), [onRemove, attachment.id])
  return (
    <Attachment data={attachment} key={attachment.id} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  )
})

AttachmentItem.displayName = 'AttachmentItem'

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()

  const handleRemove = useCallback((id: string) => attachments.remove(id), [attachments])

  if (attachments.files.length === 0) {
    return null
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem attachment={attachment} key={attachment.id} onRemove={handleRemove} />
      ))}
    </Attachments>
  )
}

export const PromptInputComp = () => {
  const router = useRouter()
  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<Model>(MODELS[0])
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const { status } = useChat()
  const queryClient = useQueryClient()
  const createProjectMutation = useMutation({
    mutationFn: createProjectRequest,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      router.push(`/project/${project.id}`)
    }
  })

  async function createProject(message: PromptInputMessage) {
    await createProjectMutation.mutateAsync({ text: message.text, attachments: message.files })
  }

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)
    if (!(hasText || hasAttachments)) {
      return
    }
    logger.info({ prompt: message, model })
    const session = await authClient.getSession()

    if (!session) {
      toast.add({ type: 'error', description: 'You need to sign in first' })
      return
    }

    const { data } = await api.get(`/api-key/check`)
    logger.info('API key exists: ', data.exists)
    if (!data.exists) {
      setShowApiKeyModal(true)
      return
    }

    try {
      if (text) {
        await createProject(message)
      }
      setText('')
    } catch {
      toast.add({ type: 'error', description: 'Failed to create project' })
    }
  }

  async function onCreateApiKeySuccess() {
    setShowApiKeyModal(false)
  }

  return (
    <div className="size-full">
      <PromptInput onSubmit={handleSubmit} globalDrop multiple>
        <PromptInputHeader>
          <PromptInputAttachmentsDisplay />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder="Enter a prompt"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent className={'w-fit'}>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputSelect
              onValueChange={(value) => {
                console.log(value)
                setModel(value as Model)
              }}
              value={model.name}
            >
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent className={'p-1 w-fit'}>
                {MODELS.map((model) => (
                  <PromptInputSelectItem
                    key={model.id}
                    value={model}
                    className={'flex items-center gap-2'}
                  >
                    <img
                      src={`https://models.dev/logos/${model.provider}.svg`}
                      className="size-5 dark:invert"
                    />
                    <span>{model.name}</span>
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!text && !status} status={status} />
        </PromptInputFooter>
      </PromptInput>
      <ApiKeyModal
        open={showApiKeyModal}
        onCreateApiKeySuccess={onCreateApiKeySuccess}
        onOpenChange={setShowApiKeyModal}
      />
    </div>
  )
}
