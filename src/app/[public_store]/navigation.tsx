'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { Home, ScrollText, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CartProducts } from './cart/cart-products'

export function PublicStoreNavigation({
  bagItems,
  connectedAccount,
  userData,
}: {
  connectedAccount: any
  userData: any
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
    <Card className="fixed lg:static z-50 bottom-3 left-1/2 -translate-x-1/2 lg:translate-x-0 p-1 lg:p-0 bg-background/90 lg:bg-transparent backdrop-blur-lg lg:border-0 bg-red-700">
      <NavigationMenu>
        <NavigationMenuList>
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <Link href={link.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), 'bg-transparent')}
                >
                  <link.icon className="block lg:hidden w-5 h-5" />
                  <span className="hidden lg:block">{link.name}</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'relative bg-transparent px-3',
                  )}
                >
                  {bagItems?.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-[5px] rounded-full border-2">
                      {bagItems?.length}
                    </span>
                  )}
                  <ShoppingCart className="w-5 h-5" />
                </NavigationMenuLink>
              </NavigationMenuItem>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96">
              <section className="flex flex-col gap-2">
                <ScrollArea className="max-h-[394px]">
                  <CartProducts bagItems={bagItems} storeName={storeUrl} />
                </ScrollArea>
                {connectedAccount &&
                  connectedAccount.length > 0 &&
                  productsPrice > 0 &&
                  (!userData.user ? (
                    <Link
                      href={`/${params.public_store}/sign-in`}
                      className={cn(buttonVariants(), 'w-full')}
                    >
                      Finalizar compra
                    </Link>
                  ) : (
                    <Link
                      href={`/${params.public_store}/checkout?step=pickup`}
                      className={cn(buttonVariants(), 'w-full')}
                    >
                      Finalizar compra
                    </Link>
                  ))}
              </section>
            </PopoverContent>
          </Popover>
        </NavigationMenuList>
      </NavigationMenu>
    </Card>
  )
}
