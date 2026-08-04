import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    APP_URL: z.string().min(1).default('http://localhost:3000'),
    DATABASE_URL: z.string()
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000')
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  }
})
