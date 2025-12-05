import { readStore } from "@/app/(protected)/(app)/config/(options)/layout/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import Link from "next/link";
import { Footer } from "./footer";
import { Header } from "./header";
import { SidebarButtons } from "./menu-buttons";

export async function AppSidebar() {
  const [storeData] = await readStore();
  const store = storeData?.store;

  return (
    <Sidebar collapsible="icon" className="relative">
      <SidebarContent>
        <Header store={store} />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={"/dashboard"}>
                  <Home />
                  <span>Página inicial</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarButtons />
      </SidebarContent>

      <Footer />
    </Sidebar>
  );
}
