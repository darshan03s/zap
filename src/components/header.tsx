'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { ModeToggle } from './mode-toggle'
import { SidebarTrigger, useSidebar } from './ui/sidebar'
import { User } from './user'

export const Header = ({ className }: { className?: string }) => {
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  const showHeaderLeft = isMobile ? true : !open

  return (
    <header
      className={cn(
        'h-(--header-height) min-h-(--header-height) flex items-center px-4 justify-between sticky z-10 top-0 left-0 bg-background/60 supports-backdrop-filter:backdrop-blur-md',
        className
      )}
    >
      <div className="header-left">
        {showHeaderLeft ? (
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Brand />
          </div>
        ) : null}
      </div>
      <div className="header-right flex items-center gap-4">
        <User />
        <ModeToggle />
      </div>
    </header>
  )
}
