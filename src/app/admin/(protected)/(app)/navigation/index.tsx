'use client'

import { CircleDollarSign, HomeIcon, Layers, LayoutList } from 'lucide-react'

import { LinkType } from '@/models/nav-links'
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
    route: '/admin/cash-register',
    title: 'Financeiro',
    icon: CircleDollarSign,
  },
  {
    route: '/admin/catalog',
    title: 'Catálogo',
    icon: LayoutList,
  },
]

export function MobileNavigation() {
  return <MobileNav links={navLinks} />
}
