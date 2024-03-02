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
    pathname === '/orders' ||
    pathname === '/store' ||
    pathname === '/dashboard' ||
    pathname === '/customers' ||
    pathname === '/reports'

  const links = [
    {
      href: '/dashboard',
      name: 'Home',
      icon: (
        <Home
          className={cn(
            iconsClassNames,
            'opacity-50',
            pathname.startsWith('/dashboard') && 'opacity-100',
          )}
        />
      ),
    },
    {
      href: '/orders',
      name: 'Pedidos',
      icon: (
        <Layers
          className={cn(
            iconsClassNames,
            'opacity-50',
            pathname.startsWith('/orders') && 'opacity-100',
          )}
        />
      ),
    },
    {
      href: '/store',
      name: 'Minha loja',
      icon: (
        <Store
          className={cn(
            iconsClassNames,
            'opacity-50',
            pathname.startsWith('/store') && 'opacity-100',
          )}
        />
      ),
    },
    {
      href: '/customers',
      name: 'Clientes',
      icon: (
        <Users
          className={cn(
            iconsClassNames,
            'opacity-50',
            pathname.startsWith('/customers') && 'opacity-100',
          )}
        />
      ),
    },
    {
      href: '/reports',
      name: 'Relatórios',
      icon: (
        <BarChart2
          className={cn(
            iconsClassNames,
            'opacity-50',
            pathname.startsWith('/reports') && 'opacity-100',
          )}
        />
      ),
    },
  ]

  return (
    <nav
      className={cn(
        isRootPathname && 'translate-y-0 duration-200',
        !isRootPathname && 'translate-y-16 duration-200',
      )}
    >
      <Card className="flex flex-row items-center justify-around gap-4 w-fit p-1 px-2 bg-secondary">
        {links.map((link) => (
          <Link href={link.href} key={link.href} className="relative p-2">
            {link.icon}
            {pathname.startsWith(link.href) && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-1 bg-primary"></span>
            )}
          </Link>
        ))}
      </Card>
    </nav>
  )
}
