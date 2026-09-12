import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { UIMessage } from 'ai'
import { Workspace } from '@/components/workspace'
import { fileRepository } from '@/db/repository/fileRepository'
import { messagesRepository } from '@/db/repository/messageRepository'
import { auth } from '@/lib/auth'
import { filesToFileSystemTree } from '@/lib/filesystem-tree'

const Page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/')
  }

  const { projectId } = await params

  const messages = await messagesRepository.getAllByProjectId(projectId)
  const projectFiles = await fileRepository.getAllByProjectId(projectId)
  const fileSystemTree = filesToFileSystemTree(projectFiles)

  const initialMessages = messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.parts as UIMessage['parts']
  }))

  return (
    <Workspace
      key={projectId}
      projectId={projectId}
      initialMessages={initialMessages}
      fileSystemTree={fileSystemTree}
    />
  )
}

export default Page
