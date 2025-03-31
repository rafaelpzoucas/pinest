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
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { PopoverPortal } from '@radix-ui/react-popover'
import { Home, ScrollText, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CartProducts } from './cart/cart-products'

export function PublicStoreNavigation({
  cartProducts,
  connectedAccount,
  userData,
}: {
  connectedAccount: any
  userData: any
  cartProducts: CartProductType[] | null
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

  const finishPurchaseLink = !userData.user
    ? `/${params.public_store}/sign-in?checkout=true`
    : `/${params.public_store}/checkout?step=pickup`

  const productsPrice = cartProducts
    ? cartProducts.reduce((acc, cartProduct) => {
        const priceToAdd = cartProduct.product_price

        return acc + priceToAdd * cartProduct.quantity
      }, 0)
    : 0

  return (
    <Card
      className="fixed lg:static z-50 bottom-3 left-1/2 -translate-x-1/2 lg:translate-x-0 p-1
        lg:p-0 bg-background/90 lg:bg-transparent backdrop-blur-lg lg:border-0
        bg-red-700"
    >
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
                  {cartProducts && cartProducts?.length > 0 && (
                    <span
                      className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold
                        px-[5px] rounded-full border-2"
                    >
                      {cartProducts?.length}
                    </span>
                  )}
                  <ShoppingCart className="w-5 h-5" />
                </NavigationMenuLink>
              </NavigationMenuItem>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent align="end" className="w-96">
                <section className="flex flex-col gap-2">
                  <ScrollArea className="h-[394px]">
                    <CartProducts
                      cartProducts={cartProducts}
                      storeName={storeUrl}
                    />
                  </ScrollArea>

                  <footer className="pt-3 bg-background">
                    {connectedAccount && productsPrice > 0 && (
                      <Link
                        href={finishPurchaseLink}
                        className={cn(
                          buttonVariants(),
                          'flex justify-between w-full',
                        )}
                      >
                        Finalizar compra{' '}
                        <strong>{formatCurrencyBRL(productsPrice)}</strong>
                      </Link>
                    )}
                  </footer>
                </section>
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </NavigationMenuList>
      </NavigationMenu>
    </Card>
  )
}
