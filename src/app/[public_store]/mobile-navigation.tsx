'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { Home, ScrollText, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { SearchSheet } from './(app)/(search)/search-sheet'

export function MobileNavigation({
  cartProducts,
}: {
  cartProducts: CartProductType[] | null
}) {
  const params = useParams()
  const pathname = usePathname()

  const storeUrl = params.public_store as unknown as string

  const iconsClassNames = 'w-5 h-5'

  const links = [
    {
      href: `/${storeUrl}`,
      name: 'Home',
      icon: Home,
    },
    {
      href: `/${storeUrl}/purchases`,
      name: 'Meus pedidos',
      icon: ScrollText,
    },
  ]

  return (
    <nav
      className={cn(
        'fixed lg:hidden z-50 bottom-0 left-0 flex items-center justify-center p-2 w-full',
        'lg:static lg:p-4 lg:w-fit',
      )}
    >
      <Card className="flex flex-row lg:flex-col items-center justify-between gap-4 w-fit p-1 bg-background/90 backdrop-blur-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'bg-transparent relative',
            )}
          >
            <link.icon
              className={cn(
                iconsClassNames,
                'opacity-50',
                pathname === link.href && 'opacity-100',
              )}
            />
            {pathname === link.href && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-8 bg-primary"></span>
            )}
          </Link>
        ))}

        <div
          className={cn(
            'relative',
            pathname !== `/${storeUrl}/search` && 'opacity-50',
          )}
        >
          <SearchSheet publicStore={storeUrl} />
          {pathname === `/${storeUrl}/search` && (
            <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg -mt-1 bg-primary"></span>
          )}
        </div>

        <Link
          href={`/${storeUrl}/cart`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'relative bg-transparent',
          )}
        >
          {cartProducts && cartProducts?.length > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-[5px] rounded-full border-2">
              {cartProducts?.length}
            </span>
          )}

          <div
            className={cn(
              'relative',
              pathname !== `/${storeUrl}/cart` && 'opacity-50',
            )}
          >
            <ShoppingCart className="w-5 h-5" />

            {pathname === `/${storeUrl}/cart` && (
              <span className="absolute left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-lg mt-1 bg-primary"></span>
            )}
          </div>
        </Link>
      </Card>
    </nav>
  )
}
