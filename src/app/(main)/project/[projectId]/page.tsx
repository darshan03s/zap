import { UIMessage } from 'ai'
import { Workspace } from '@/components/workspace'
import { messagesRepository } from '@/db/repository/messageRepository'

const Page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params

  const messages = await messagesRepository.getAllByProjectId(projectId)

  const initialMessages = messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.parts as UIMessage['parts']
  }))

  return <Workspace projectId={projectId} initialMessages={initialMessages} />
}

export default Page
