import { cn } from '@/lib/utils'

export const Main = ({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  props?: React.ComponentProps<'main'>
}) => {
  return (
    <main className={cn('', className)} {...props}>
      {children}
    </main>
  )
}
