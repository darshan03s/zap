import z from 'zod'
import { PROVIDERS } from '@/constants'
import { Provider } from '@/types'
import { api } from '../api'

export const createApiKey = async (params: { provider: Provider | 'default'; apiKey: string }) => {
  const response = await api.post('/api-key', {
    ...params
  })

  return response.data
}

export const CreateApiKeyRequest = z.object({
  provider: z.enum([...PROVIDERS, 'default']),
  apiKey: z.string()
})
