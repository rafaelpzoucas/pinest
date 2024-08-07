'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Layers, LayoutGrid, LayoutList, Store } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const iconsClassNames = 'w-5 h-5'

  const hide = pathname.includes('/register')

  const links = [
    {
      href: '/admin/dashboard',
      name: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      href: '/admin/purchases',
      name: 'Pedidos',
      icon: Layers,
    },
    {
      href: '/admin/catalog',
      name: 'Catálogo',
      icon: LayoutList,
    },
    {
      href: '/admin/store',
      name: 'Minha loja',
      icon: Store,
    },
  ]

  return (
    <nav
      className={cn(
        !hide && 'translate-y-0 duration-200',
        hide && 'translate-y-16 duration-200',
        'fixed z-50 bottom-0 left-0 flex items-center justify-center p-2 w-full',
        'lg:static lg:p-4 lg:w-fit',
      )}
    >
      <Card className="flex flex-row lg:flex-col items-center justify-around gap-4 w-fit p-1 px-2 bg-background">
        {links.map((link) => (
          <Link href={link.href} key={link.href} className="relative p-2">
            <link.icon
              className={cn(
                iconsClassNames,
                'opacity-50',
                pathname.startsWith(link.href) && 'opacity-100',
              )}
            />
            {pathname.startsWith(link.href) && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-1 bg-primary"></span>
            )}
          </Link>
        ))}
      </Card>
    </nav>
  )
}
