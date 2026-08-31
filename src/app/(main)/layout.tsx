import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarProvider } from '@/components/ui/sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          {children}
        </div>
      </SidebarProvider>
    </>
  )
}

export default Layout
