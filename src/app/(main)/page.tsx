import { Main } from '@/components/main'
import { PromptInputComp } from '@/components/prompt-input-comp'

const Page = () => {
  return (
    <Main className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-2">
        <p className="text-4xl font-mono text-center">Create.Preview.Copy</p>
        <div className="text-center text-muted-foreground text-xs">Create components using AI</div>
        <PromptInputComp />
      </div>
    </Main>
  )
}

export default Page
