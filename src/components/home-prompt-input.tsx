'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { MODELS } from '@/constants'
import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { logger } from '@/lib/logger'
import { createProject as createProjectRequest } from '@/lib/requests/project'
import { Model } from '@/types'
import { ApiKeyModal } from './api-key-modal'
import { PromptInputComp } from './prompt-input-comp'
import { toast } from './ui/toast'

export const HomePromptInput = () => {
  const router = useRouter()
  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<Model>(() => {
    const savedModel = localStorage.getItem('model')
    return MODELS.find((m) => m.id === savedModel) ?? MODELS[0]
  })
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
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
      <PromptInputComp
        handleSubmit={handleSubmit}
        text={text}
        onTextInputChange={(text) => setText(text)}
        model={model}
        onModelChange={(model) => {
          setModel(model)
          localStorage.setItem('model', model.id as string)
        }}
      />
      <ApiKeyModal
        open={showApiKeyModal}
        onCreateApiKeySuccess={onCreateApiKeySuccess}
        onOpenChange={setShowApiKeyModal}
      />
    </div>
  )
}
