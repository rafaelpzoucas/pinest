'use client'

import { Layers, LayoutGrid, LayoutList, Settings } from 'lucide-react'

import { LinkType } from '@/models/nav-links'
import { DesktopNav } from './desktop/sidebar'
import { MobileNav } from './mobile'

export function Navigation() {
  const links: LinkType[] = [
    {
      route: '/admin/dashboard',
      title: 'Dashboard',
      icon: LayoutGrid,
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
      route: '/admin/config',
      title: 'Configurações',
      icon: Settings,
      subLinks: [
        {
          title: 'Conta',
          route: '/admin/config/account',
        },
        {
          title: 'Pagamento',
          route: '/admin/config/billing',
        },
        {
          title: 'Envio',
          route: '/admin/config/shipping',
        },
      ],
    },
  ]

  return (
    <>
      <MobileNav links={links} />
      <DesktopNav links={links} />
    </>
  )
}
