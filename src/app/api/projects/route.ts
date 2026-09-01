import { projectRepository } from '@/db/repository/projectRepository'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/errors'
import { requireSession } from '@/lib/guards'
import { CreateProjectRequest } from '@/lib/requests/project'

export const GET = withErrorHandler(async () => {
  const { userId } = await requireSession()

  const projects = await projectRepository.getByUserId(userId)

  return Response.json({ projects })
})

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await requireSession()

  const parsed = CreateProjectRequest.safeParse(await req.json())

  if (!parsed.success) {
    throw new ApiError('Bad request', 'BAD_REQUEST', 400)
  }

  const [project] = await projectRepository.create({
    userId,
    title: parsed.data.text
  })

  return Response.json({ project }, { status: 201 })
})
