import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    APP_URL: z.string().min(1).default('http://localhost:3000'),
    DATABASE_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    AI_GATEWAY_API_KEY: z.string(),
    ENCRYPTION_KEY: z.string()
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000')
  },
  runtimeEnv: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  }
})
