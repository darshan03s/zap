import { Workspace } from '@/components/workspace'

const Page = ({ params }: { params: Promise<{ projectId: string }> }) => {
  return <Workspace />
}

export default Page
