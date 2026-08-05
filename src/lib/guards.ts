import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { ApiError } from './errors'

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  return { session, userId: session.user.id }
}
