'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebContainerIDEProvider } from '@/components/webcontainer-ide'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <WebContainerIDEProvider rootDir="project">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            {children}
          </div>
        </WebContainerIDEProvider>
      </SidebarProvider>
    </>
  )
}

export default Layout
