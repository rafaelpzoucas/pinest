'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, createPath, getRootPath } from '@/lib/utils'
import { usePublicStore } from '@/stores/public-store'
import { Home, ReceiptText, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchSheet } from './(app)/search/search-sheet'

export function MobileNavigation({
  storeSubdomain,
}: {
  storeSubdomain: string
}) {
  const pathname = usePathname()

  const { cart } = usePublicStore()

  if (pathname.includes('register')) {
    return null
  }

  const rootPath = getRootPath(storeSubdomain)

  // Função auxiliar para verificar se um pathname corresponde a um determinado caminho
  const isCurrentPath = (path: string) => {
    const formattedPath = createPath(path, storeSubdomain)
    return pathname === formattedPath
  }

  const links = [
    {
      href: rootPath ? createPath('/', storeSubdomain) : '/',
      name: 'Home',
      icon: Home,
    },
    {
      href: createPath('/orders', storeSubdomain),
      name: 'Pedidos',
      icon: ReceiptText,
    },
  ]

  return (
    <nav
      className={cn(
        'fixed lg:hidden z-50 bottom-0 left-0 flex items-center justify-center p-2 w-full',
        'lg:static lg:p-4 lg:w-fit',
      )}
    >
      <Card
        className="flex flex-row lg:flex-col items-center justify-between gap-4 w-fit h-fit p-2
          bg-background/90 backdrop-blur-sm"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'bg-transparent relative w-12',
            )}
          >
            <link.icon
              className={cn(
                'opacity-50 w-6 h-6',
                pathname === link.href && 'opacity-100',
              )}
            />
            {pathname === link.href && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-8 bg-primary"></span>
            )}
          </Link>
        ))}

        <div
          className={cn('relative', !isCurrentPath('/search') && 'opacity-50')}
        >
          <SearchSheet subdomain={storeSubdomain} />
          {isCurrentPath('/search') && (
            <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg -mt-1 bg-primary"></span>
          )}
        </div>

        <Link
          href={createPath('/cart', storeSubdomain)}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'relative bg-transparent w-12',
          )}
        >
          {cart && cart?.length > 0 && (
            <span
              className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold
                px-[5px] rounded-full border-2"
            >
              {cart?.length}
            </span>
          )}

          <div
            className={cn('relative', !isCurrentPath('/cart') && 'opacity-50')}
          >
            <ShoppingCart className="w-5 h-5" />

            {isCurrentPath('/cart') && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-1 bg-primary"></span>
            )}
          </div>
        </Link>
      </Card>
    </nav>
  )
}
