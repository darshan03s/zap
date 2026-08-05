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
    id: 'openai/gpt-5.5',
    name: 'GPT-5.5',
    provider: 'openai'
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'anthropic'
  },
  {
    id: 'google/gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'google'
  }
]
