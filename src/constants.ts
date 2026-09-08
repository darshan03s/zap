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
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google'
  },
]

export const FREE_MODELS: Model[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google'
  },
]

export const ANTHROPIC_MODELS: Model[] = [
  {
    id: 'anthropic/claude-fable-5-1',
    name: 'Claude Fable 5.1',
    provider: 'anthropic'
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'anthropic'
  },
]

export const OPENAI_MODELS: Model[] = [
  {
    id: 'openai/gpt-6-astra',
    name: 'GPT-6 Astra',
    provider: 'openai'
  },
  {
    id: 'openai/gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'openai'
  },
]

export const GOOGLE_MODELS: Model[] = [
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google'
  },
  {
    id: 'google/gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'google'
  },
]
