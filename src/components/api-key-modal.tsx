'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Key } from 'lucide-react'
import { PROVIDERS, PROVIDER_NAMES } from '@/constants'
import { createApiKey } from '@/lib/requests/api-key'
import { Provider } from '@/types'
import { Modal } from './modal'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export const ApiKeyModal = ({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(PROVIDERS[0])
  const [apiKey, setApiKey] = useState('')
  const createApiKeyMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  async function handleSubmit(defaultProvider?: boolean) {
    if (!defaultProvider && apiKey.trim().length === 0) return

    createApiKeyMutation.mutate({
      provider: defaultProvider ? 'default' : selectedProvider,
      apiKey: defaultProvider ? '' : apiKey
    })
  }

  return (
    <Modal
      title="API key"
      description="Set API key for using AI"
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      disablePointerDismissal
    >
      <div className="space-y-4">
        <Input
          placeholder="Enter API key"
          type="password"
          onChange={(e) => setApiKey(e.target.value)}
          value={apiKey}
        />
        <Select
          onValueChange={(v) => setSelectedProvider(v as Provider)}
          value={PROVIDER_NAMES[selectedProvider]}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={'p-2'}>
            {PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {PROVIDER_NAMES[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-muted-foreground text-sm">Or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div>
          <Button
            className={'w-full'}
            variant={'outline'}
            onClick={() => handleSubmit(true)}
            disabled={createApiKeyMutation.isPending}
          >
            <Key /> Use default API key
          </Button>
          <p className="text-center text-xs text-destructive">
            Max 3 generations allowed with default key
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => handleSubmit()} disabled={createApiKeyMutation.isPending}>
          {createApiKeyMutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </Modal>
  )
}
