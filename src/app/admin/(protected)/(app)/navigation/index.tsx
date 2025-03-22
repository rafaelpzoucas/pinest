'use client'

import {
  Blocks,
  ChartPie,
  CircleDollarSign,
  HomeIcon,
  Layers,
  LayoutDashboard,
  LayoutList,
  Settings,
  Truck,
  User,
} from 'lucide-react'

import { LinkType } from '@/models/nav-links'
import { DesktopNav } from './desktop/sidebar'
import { MobileNav } from './mobile'

export const navLinks: LinkType[] = [
  {
    route: '/admin/dashboard',
    title: 'Dashboard',
    icon: HomeIcon,
  },
  {
    route: '/admin/purchases',
    title: 'Pedidos',
    icon: Layers,
  },
  {
    route: '/admin/catalog',
    title: 'Catálogo',
    icon: LayoutList,
  },
  {
    route: '/admin/reports',
    title: 'Relatórios',
    icon: ChartPie,
  },
  {
    route: '/admin/integrations',
    title: 'Integrações',
    icon: Blocks,
  },
  {
    route: '/admin/config',
    title: 'Configurações',
    icon: Settings,
    subLinks: [
      {
        icon: User,
        title: 'Conta',
        route: '/admin/config/account',
      },
      {
        icon: LayoutList,
        title: 'Catálogo',
        route: '/admin/catalog',
      },
      {
        icon: LayoutDashboard,
        title: 'Organização da loja',
        route: '/admin/config/layout',
      },
      {
        icon: CircleDollarSign,
        title: 'Pagamento',
        route: '/admin/config/billing',
      },
      {
        icon: Truck,
        title: 'Envio',
        route: '/admin/config/shipping',
      },
    ],
  },
]

export function Navigation() {
  return (
    <>
      <MobileNav links={navLinks} />
      <DesktopNav links={navLinks} />
    </>
  )
}
