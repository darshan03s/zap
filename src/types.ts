import { LanguageModel } from 'ai'
import { PROVIDERS } from './constants'

export type Provider = (typeof PROVIDERS)[number]

export type Model = {
  id: LanguageModel
  name: string
  provider: Provider
}
