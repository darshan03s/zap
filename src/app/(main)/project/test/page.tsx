import { notFound } from 'next/navigation'
import { Workspace } from '@/components/workspace'

const Page = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <Workspace projectId="test" initialMessages={[]} fileSystemTree={{}} />
}

export default Page
