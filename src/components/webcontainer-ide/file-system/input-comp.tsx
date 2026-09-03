import { RefObject } from 'react'
import { Input } from '@/components/ui/input'

export const InputComp = ({
  onSubmit,
  onBlur,
  name,
  placeholder,
  defaultValue,
  inputRef
}: {
  onSubmit: (form: HTMLFormElement) => void
  onBlur: () => void
  name: string
  placeholder: string
  defaultValue?: string
  inputRef?: RefObject<HTMLInputElement | null>
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(e.currentTarget)
      }}
    >
      <Input
        defaultValue={defaultValue}
        autoFocus
        ref={inputRef}
        onBlur={onBlur}
        name={name}
        className="ide-file-system-input h-5 text-[10px]! placeholder:text-[10px] focus-visible:ring-0"
        placeholder={placeholder}
      />
    </form>
  )
}
