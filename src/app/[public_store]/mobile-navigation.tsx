'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { Home, ScrollText, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SearchSheet } from './(app)/@search/search-sheet'

export function MobileNavigation({
  bagItems,
}: {
  bagItems: CartProductType[]
}) {
  const params = useParams()

  const storeUrl = params.public_store as unknown as string

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

  const productsPrice =
    bagItems &&
    bagItems.reduce((acc, bagItem) => {
      const priceToAdd =
        bagItem.promotional_price > 0
          ? bagItem.promotional_price
          : bagItem.price

      return acc + priceToAdd * bagItem.amount
    }, 0)

  return (
    <Card className="fixed lg:hidden z-50 bottom-3 left-1/2 -translate-x-1/2 p-2 bg-background/90 backdrop-blur-sm">
      <NavigationMenu>
        <NavigationMenuList>
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <Link href={link.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'bg-transparent',
                  )}
                >
                  <link.icon className="w-5 h-5" />
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}

          <SearchSheet publicStore={storeUrl} />

          <NavigationMenuItem>
            <Link href={`/${storeUrl}/cart`} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'relative bg-transparent',
                )}
              >
                {bagItems?.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-[5px] rounded-full border-2">
                    {bagItems?.length}
                  </span>
                )}
                <ShoppingCart className="w-5 h-5" />
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Card>
  )
}
