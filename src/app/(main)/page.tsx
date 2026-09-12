import { HomePromptInput } from '@/components/home-prompt-input'
import { Main } from '@/components/main'

const Page = () => {
  return (
    <Main className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-2">
        <p className="text-6xl font-mono text-center">Create.Preview.Copy</p>
        <div className="text-center text-muted-foreground text-sm">Create components using AI</div>
        <div className="max-w-xl mx-auto">
          <HomePromptInput />
        </div>
      </div>
    </Main>
  )
}

export default Page
