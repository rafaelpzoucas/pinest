'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { main, reports, settings } from './items'

export function SidebarButtons() {
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

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

  return (
    <>
      <SidebarTrigger className="absolute top-1/2 -translate-y-1/2 -right-6">
        <ChevronLeft
          className="opacity-50 data-[collapsed=true]:rotate-180 transition-all duration-500"
          data-collapsed={isCollapsed}
        />
      </SidebarTrigger>

      {groups.map((group) => (
        <SidebarGroup>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) =>
                isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton>
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span className="sr-only">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
