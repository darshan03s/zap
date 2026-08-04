import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { env } from '@/env'
import { APP_URL } from '@/metadata'

export const auth = betterAuth({
  baseURL: APP_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  }
})
