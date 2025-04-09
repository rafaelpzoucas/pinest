import { readStore } from '@/app/admin/(protected)/(app)/config/(options)/layout/actions'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { GitCommitVertical, Home } from 'lucide-react'
import Link from 'next/link'
import { Footer } from './footer'
import { Header } from './header'
import { SidebarButtons } from './menu-buttons'

export async function AppSidebar() {
  const [storeData] = await readStore()
  const store = storeData?.store

  return (
    <Sidebar collapsible="icon" className="relative">
      <SidebarTrigger className="absolute top-1/2 -translate-y-1/2 -right-6">
        <GitCommitVertical className="opacity-50" />
      </SidebarTrigger>

      <SidebarContent>
        <Header store={store} />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={'/admin/dashboard'}>
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarButtons />
      </SidebarContent>

      <Footer />
    </Sidebar>
  )
}
