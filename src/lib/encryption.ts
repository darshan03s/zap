import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from '@/env'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(env.ENCRYPTION_KEY, 'base64')

export function encrypt(text: string) {
  const iv = randomBytes(12)

  const cipher = createCipheriv(algorithm, key, iv)

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])

  const authTag = cipher.getAuthTag()

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  }
}

export function decrypt(data: { encrypted: string; iv: string; authTag: string }) {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(data.iv, 'base64'))

  decipher.setAuthTag(Buffer.from(data.authTag, 'base64'))

  return Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, 'base64')),
    decipher.final()
  ]).toString('utf8')
}
