import { readStore } from '@/app/admin/(protected)/(app)/config/(options)/layout/actions'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { GitCommitVertical, Home } from 'lucide-react'
import { Footer } from './footer'
import { Header } from './header'
import { main, reports, settings } from './items'

const groups = [
  {
    label: 'Principal',
    items: main,
  },
  {
    label: 'Configurações',
    items: settings,
  },
  {
    label: 'Relatórios',
    items: reports,
  },
]
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
                <a href={'/admin/dashboard'}>
                  <Home />
                  <span>Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {groups.map((group) => (
          <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <Footer />
    </Sidebar>
  )
}
