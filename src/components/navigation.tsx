'use client'

import { cn } from '@/lib/utils'
import { BarChart2, Home, Layers, Store, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from './ui/card'

export function Navigation() {
  const pathname = usePathname()

  const iconsClassNames = 'w-5 h-5'

  const isRootPathname =
    pathname === '/admin/orders' ||
    pathname === '/admin/store' ||
    pathname === '/admin/dashboard' ||
    pathname === '/admin/customers' ||
    pathname === '/admin/reports'

  const links = [
    {
      href: '/admin/dashboard',
      name: 'Home',
      icon: Home,
    },
    {
      href: '/admin/orders',
      name: 'Pedidos',
      icon: Layers,
    },
    {
      href: '/admin/store',
      name: 'Minha loja',
      icon: Store,
    },
    {
      href: '/admin/customers',
      name: 'Clientes',
      icon: Users,
    },
    {
      href: '/admin/reports',
      name: 'Relatórios',
      icon: BarChart2,
    },
  ]

  return (
    <nav
      className={cn(
        isRootPathname && 'translate-y-0 duration-200',
        !isRootPathname && 'translate-y-16 duration-200',
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
