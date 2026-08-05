import { PROVIDERS } from './constants'

export type Provider = (typeof PROVIDERS)[number]

export type Model = {
  id: string
  name: string
  provider: Provider
}
