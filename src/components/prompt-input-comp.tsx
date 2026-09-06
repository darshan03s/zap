'use client'

import { Key, memo, useCallback } from 'react'
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
import { MODELS } from '@/constants'
import { Model } from '@/types'
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments
} from './ai-elements/attachments'

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
            onValueChange={(value) => onModelChange(value as Model)}
            value={model.name}
          >
            <PromptInputSelectTrigger>
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent className={'p-1 w-fit'}>
              {MODELS.map((model) => (
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
            </PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!text && !status} status={status} />
      </PromptInputFooter>
    </PromptInput>
  )
}
