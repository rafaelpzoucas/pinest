"use client";

import { CircleDollarSign, HomeIcon, Layers, LayoutList } from "lucide-react";

import { LinkType } from "@/models/nav-links";
import { MobileNav } from "./mobile";

export const navLinks: LinkType[] = [
  {
    route: "/dashboard",
    title: "Dashboard",
    icon: HomeIcon,
  },
  {
    route: "/orders",
    title: "Pedidos",
    icon: Layers,
  },
  {
    route: "/cash-register",
    title: "Financeiro",
    icon: CircleDollarSign,
  },
  {
    route: "/catalog",
    title: "Catálogo",
    icon: LayoutList,
  },
];

export function MobileNavigation() {
  return <MobileNav links={navLinks} />;
}
