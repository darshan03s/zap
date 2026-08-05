'use client'

import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ReactQueryProvider } from './react-query-provider'
import { ThemeProvider } from './theme-provider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
