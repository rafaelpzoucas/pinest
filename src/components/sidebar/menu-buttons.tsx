"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { main, reports, settings } from "./items";

export function SidebarButtons() {
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

  const groups = [
    {
      label: "Principal",
      items: main,
    },
    {
      label: "Configurações",
      items: settings,
    },
    {
      label: "Relatórios",
      items: reports,
    },
  ];

  return (
    <>
      <SidebarTrigger className="absolute top-1/2 -translate-y-1/2 -right-6">
        <ChevronLeft
          className="opacity-50 data-[collapsed=true]:rotate-180 transition-all duration-500"
          data-collapsed={isCollapsed}
        />
      </SidebarTrigger>

      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
