import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { ModeToggle } from './mode-toggle'

export const Header = ({ className }: { className?: string }) => {
  return (
    <header
      className={cn(
        '[--header-height:--spacing(10)] h-(--header-height) min-h-(--header-height) bg-background/60 flex items-center justify-between px-4 sticky top-0 left-0 z-10 supports-backdrop-filter:backdrop-blur-md',
        className
      )}
    >
      <div className="header-left">
        <Link to={'/'}>vite-app</Link>
      </div>
      <div className="header-right flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  )
}
