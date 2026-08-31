import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Brand } from './brand'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <SidebarTrigger />
        <Brand />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
