import { Model, Provider } from './types'

export const PROVIDERS = ['vercel_ai_gateway', 'anthropic', 'openai', 'google'] as const

export const PROVIDER_NAMES: Record<Provider, string> = {
  vercel_ai_gateway: 'Vercel AI Gateway',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google'
}

export const MODELS: Model[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google'
  }
]
