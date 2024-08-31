'use client'

import { Layers, LayoutGrid, LayoutList, Store } from 'lucide-react'

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
      route: '/admin/store',
      title: 'Minha loja',
      icon: Store,
      subLinks: [
        {
          title: 'Conta',
          route: '/admin/store/account',
        },
        {
          title: 'Formas de pagamento',
          route: '/admin/store/billing',
        },
        {
          title: 'Formas de envio',
          route: '/admin/store/shipping',
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
