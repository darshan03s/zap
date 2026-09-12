import { notFound } from 'next/navigation'
import { UIMessage } from 'ai'
import { Workspace } from '@/components/workspace'

const Page = async () => {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const dummyInitialMessages: UIMessage[] = [
    {
      id: 'msg-1',
      role: 'user',
      parts: [{ type: 'text', text: 'Create a simple button component with a label prop.' }]
    },
    {
      id: 'msg-2',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: "I'll create a Button component for you in `src/components/Button.tsx`."
        },
        {
          type: 'tool-writeFile',
          toolCallId: 'call-1',
          state: 'output-available',
          input: {
            path: 'src/components/Button.tsx',
            content:
              'export function Button({ label }: { label: string }) {\n  return <button className="rounded-md bg-zinc-900 px-4 py-2 text-white">{label}</button>\n}'
          },
          output: { path: 'src/components/Button.tsx', created: true }
        },
        {
          type: 'text',
          text: 'The Button component is ready. You can preview it in the browser.'
        }
      ]
    },
    {
      id: 'msg-3',
      role: 'user',
      parts: [{ type: 'text', text: 'Make the button blue with a hover effect.' }]
    },
    {
      id: 'msg-4',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: "Done! I've updated the button with a blue background and a darker hover state."
        },
        {
          type: 'tool-writeFile',
          toolCallId: 'call-2',
          state: 'output-available',
          input: {
            path: 'src/components/Button.tsx',
            content:
              'export function Button({ label }: { label: string }) {\n  return <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{label}</button>\n}'
          },
          output: { path: 'src/components/Button.tsx', created: false }
        }
      ]
    },
    {
      id: 'msg-5',
      role: 'user',
      parts: [{ type: 'text', text: 'Add size variants: sm, md, and lg.' }]
    },
    {
      id: 'msg-6',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Adding a `size` prop with three variants. Small gets tighter padding, large gets more.'
        },
        {
          type: 'tool-writeFile',
          toolCallId: 'call-3',
          state: 'output-available',
          input: {
            path: 'src/components/Button.tsx',
            content:
              'type ButtonSize = "sm" | "md" | "lg"\n\nconst sizeClasses: Record<ButtonSize, string> = {\n  sm: "px-3 py-1 text-sm",\n  md: "px-4 py-2 text-base",\n  lg: "px-6 py-3 text-lg"\n}\n\nexport function Button({ label, size = "md" }: { label: string; size?: ButtonSize }) {\n  return (\n    <button className={`rounded-md bg-blue-600 text-white hover:bg-blue-700 ${sizeClasses[size]}`}>\n      {label}\n    </button>\n  )\n}'
          },
          output: { path: 'src/components/Button.tsx', created: false }
        },
        {
          type: 'text',
          text: 'Size variants are in place. Default is `md`.'
        }
      ]
    },
    {
      id: 'msg-7',
      role: 'user',
      parts: [{ type: 'text', text: 'Use the button on the index page so I can preview all three sizes.' }]
    },
    {
      id: 'msg-8',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Let me check the current index page first.'
        },
        {
          type: 'tool-readFile',
          toolCallId: 'call-4',
          state: 'output-available',
          input: { filepath: 'src/pages/index.tsx' },
          output: {
            path: 'src/pages/index.tsx',
            content: 'export default function Home() {\n  return <div className="p-8">Hello world</div>\n}'
          }
        },
        {
          type: 'tool-writeFile',
          toolCallId: 'call-5',
          state: 'output-available',
          input: {
            path: 'src/pages/index.tsx',
            content:
              'import { Button } from "../components/Button"\n\nexport default function Home() {\n  return (\n    <div className="flex items-center gap-4 p-8">\n      <Button label="Small" size="sm" />\n      <Button label="Medium" size="md" />\n      <Button label="Large" size="lg" />\n    </div>\n  )\n}'
          },
          output: { path: 'src/pages/index.tsx', created: false }
        },
        {
          type: 'tool-activeFilePath',
          toolCallId: 'call-6',
          state: 'output-available',
          input: { filepath: 'src/pages/index.tsx' },
          output: { path: 'src/pages/index.tsx' }
        },
        {
          type: 'text',
          text: 'Updated the index page with all three button sizes. It should be open in the editor now.'
        }
      ]
    },
    {
      id: 'msg-9',
      role: 'user',
      parts: [{ type: 'text', text: 'Also add a disabled state.' }]
    },
    {
      id: 'msg-10',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Adding an optional `disabled` prop with reduced opacity and no pointer events.'
        },
        {
          type: 'tool-writeFile',
          toolCallId: 'call-7',
          state: 'output-available',
          input: {
            path: 'src/components/Button.tsx',
            content:
              'type ButtonSize = "sm" | "md" | "lg"\n\nconst sizeClasses: Record<ButtonSize, string> = {\n  sm: "px-3 py-1 text-sm",\n  md: "px-4 py-2 text-base",\n  lg: "px-6 py-3 text-lg"\n}\n\nexport function Button({\n  label,\n  size = "md",\n  disabled = false\n}: {\n  label: string\n  size?: ButtonSize\n  disabled?: boolean\n}) {\n  return (\n    <button\n      disabled={disabled}\n      className={`rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]}`}\n    >\n      {label}\n    </button>\n  )\n}'
          },
          output: { path: 'src/components/Button.tsx', created: false }
        },
        {
          type: 'text',
          text: 'Disabled state is ready. Want me to add a disabled example to the preview page too?'
        }
      ]
    }
  ]

  return (
    <Workspace
      projectId="test"
      initialMessages={dummyInitialMessages}
      fileSystemTree={'/api/snapshot'}
    />
  )
}

export default Page
