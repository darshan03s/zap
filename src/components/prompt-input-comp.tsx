'use client'

import { Key, memo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatStatus } from 'ai'
import { ImageIcon } from 'lucide-react'
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputMessage,
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
import { ANTHROPIC_MODELS, GOOGLE_MODELS, MODELS, OPENAI_MODELS } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { getApiKeys } from '@/lib/requests/api-key'
import { Model } from '@/types'
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments
} from './ai-elements/attachments'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'

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

const AddAttachmentsMenuItem = () => {
  const attachments = usePromptInputAttachments()

  const handleClick = useCallback(() => {
    attachments.openFileDialog()
  }, [attachments])

  return (
    <PromptInputActionMenuItem onClick={handleClick}>
      <ImageIcon className="mr-2 size-4" /> Add images
    </PromptInputActionMenuItem>
  )
}

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

const isModel = (value: unknown): value is Model =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'name' in value &&
  'provider' in value

const ModelSelector = () => {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: apiKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: getApiKeys,
    enabled: !!session
  })

  const isLoadingByokModels = isSessionPending || (!!session && apiKeys === undefined)

  const hasAnthropicApiKey = apiKeys?.some(
    (apiKey) => apiKey.provider === 'anthropic' && apiKey.apiKeyMode === 'byok'
  )
  const hasOpenAiApiKey = apiKeys?.some(
    (apiKey) => apiKey.provider === 'openai' && apiKey.apiKeyMode === 'byok'
  )
  const hasGoogleApiKey = apiKeys?.some(
    (apiKey) => apiKey.provider === 'google' && apiKey.apiKeyMode === 'byok'
  )

  return (
    <PromptInputSelectContent className={'p-1 w-fit'}>
      {isLoadingByokModels ? (
        <Skeleton className="mb-1 h-10 w-full" />
      ) : (
        <>
          {hasAnthropicApiKey && (
            <>
              <span className="pl-2 text-xs opacity-50">Anthropic</span>
              {ANTHROPIC_MODELS.map((model) => (
                <PromptInputSelectItem
                  key={model.id as Key | null | undefined}
                  value={model}
                  className={'flex items-center gap-2'}
                >
                  <img
                    src={`/provider-logos/${model.provider}.svg`}
                    className="size-5 dark:invert"
                  />
                  <span>{model.name}</span>
                </PromptInputSelectItem>
              ))}
            </>
          )}
          {hasOpenAiApiKey && (
            <>
              <span className="pl-2 text-xs opacity-50">OpenAI</span>
              {OPENAI_MODELS.map((model) => (
                <PromptInputSelectItem
                  key={model.id as Key | null | undefined}
                  value={model}
                  className={'flex items-center gap-2'}
                >
                  <img
                    src={`/provider-logos/${model.provider}.svg`}
                    className="size-5 dark:invert"
                  />
                  <span>{model.name}</span>
                </PromptInputSelectItem>
              ))}
            </>
          )}
          {hasGoogleApiKey && (
            <>
              <span className="pl-2 text-xs opacity-50">Google</span>
              {GOOGLE_MODELS.map((model) => (
                <PromptInputSelectItem
                  key={model.id as Key | null | undefined}
                  value={model}
                  className={'flex items-center gap-2'}
                >
                  <img
                    src={`/provider-logos/${model.provider}.svg`}
                    className="size-5 dark:invert"
                  />
                  <span>{model.name}</span>
                </PromptInputSelectItem>
              ))}
            </>
          )}
        </>
      )}
      <span className="pl-2 text-xs opacity-50">Free</span>
      {MODELS.map((model) => (
        <PromptInputSelectItem
          key={model.id as Key | null | undefined}
          value={model}
          className={'flex items-center gap-2'}
        >
          <img src={`/provider-logos/${model.provider}.svg`} className="size-5 dark:invert" />
          <span>{model.name}</span>
        </PromptInputSelectItem>
      ))}
    </PromptInputSelectContent>
  )
}

interface PromptInputCompProps {
  handleSubmit: (message: PromptInputMessage) => void
  text: string
  onTextInputChange: (text: string) => void
  model: Model
  onModelChange: (model: Model) => void
  status?: ChatStatus
}

export const PromptInputComp = ({
  handleSubmit,
  text,
  onTextInputChange,
  model,
  onModelChange,
  status
}: PromptInputCompProps) => {
  const selectedModel = model ?? MODELS[0]

  return (
    <PromptInput onSubmit={handleSubmit} globalDrop multiple accept="image/*">
      <PromptInputHeader>
        <PromptInputAttachmentsDisplay />
      </PromptInputHeader>
      <PromptInputBody>
        <PromptInputTextarea
          onChange={(e) => onTextInputChange(e.target.value)}
          value={text}
          placeholder="Enter prompt"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent className={'w-fit'}>
              <AddAttachmentsMenuItem />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputSelect
            value={selectedModel}
            itemToStringLabel={(value) => (isModel(value) ? value.name : '')}
            isItemEqualToValue={(itemValue, value) =>
              isModel(itemValue) && isModel(value) && itemValue.id === value.id
            }
            onValueChange={(value) => {
              if (isModel(value)) {
                onModelChange(value)
              }
            }}
          >
            <PromptInputSelectTrigger>
              <PromptInputSelectValue placeholder="Select model" />
            </PromptInputSelectTrigger>
            <ModelSelector />
          </PromptInputSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!text && !status} status={status} />
      </PromptInputFooter>
    </PromptInput>
  )
}
