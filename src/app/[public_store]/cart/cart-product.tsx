'use client'

import { ProductCardImage } from '@/components/product-card-image'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, createPath, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ProductVariationType } from '@/models/product'
import { Edit, Loader2, Plus, Trash } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  readCartProductVariations,
  removeFromCart,
  updateCartProductQuantity,
} from './actions'

type CartProductPropsType = {
  cartProduct: CartProductType
  storeSubdomain?: string
}

export function CartProduct({
  cartProduct,
  storeSubdomain,
}: CartProductPropsType) {
  const [isQttOpen, setIsQttOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [variations, setVariations] = useState<ProductVariationType[]>([])
  const [isDeleting, setisDeleting] = useState(false)

  const product = cartProduct.products

  const totalPrice =
    cartProduct.product_price +
    (cartProduct.extras?.reduce(
      (acc, extra) => acc + extra.price * extra.quantity,
      0,
    ) || 0)

  function handleUpdateQuantity(quantity: string) {
    if (cartProduct && cartProduct.id) {
      updateCartProductQuantity(cartProduct.id, parseInt(quantity))
    }
  }

  async function handleDeleteFromCart() {
    setisDeleting(true)

    if (cartProduct && cartProduct.id) {
      await removeFromCart(cartProduct.id)
    }

    setisDeleting(false)
  }

  async function handleReadCartProductVariations() {
    const cartProductVariations = await readCartProductVariations(
      cartProduct.product_variations,
    )

    if (cartProductVariations) {
      setVariations(cartProductVariations)
    }
  }

  useEffect(() => {
    handleReadCartProductVariations()
  }, [])

  return (
    <div className="flex flex-col gap-2 py-2 border-b last:border-0 w-full">
      <Link href="">
        <div className="flex flex-row gap-5">
          <div className="max-w-12">
            <ProductCardImage productImages={product.product_images} />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-row items-center justify-between">
              <p className="line-clamp-2 max-w-56">{product.name}</p>

              <span className="text-sm">
                {formatCurrencyBRL(product.price)}
              </span>
            </div>

            {cartProduct.extras &&
              cartProduct.extras.length > 0 &&
              cartProduct.extras.map((extra) => (
                <p
                  key={extra.extra_id}
                  className="flex flex-row items-center justify-between text-xs text-muted-foreground
                    line-clamp-2 w-full"
                >
                  <span className="flex flex-row items-center">
                    <Plus className="w-4 h-4 mr-1" /> {extra.quantity} ad.{' '}
                    {extra.name}
                  </span>

                  <span>{formatCurrencyBRL(extra.price * extra.quantity)}</span>
                </p>
              ))}

            {cartProduct?.observations &&
              cartProduct?.observations?.length > 0 &&
              cartProduct.observations
                .filter((obs) => obs !== '')
                .map((obs) => (
                  <p className="text-muted-foreground text-xs uppercase line-clamp-2">
                    obs: {obs}{' '}
                  </p>
                ))}

            <div>
              {variations &&
                variations.map((variation) => (
                  <Badge
                    key={variation.id}
                    className="mr-2"
                    variant="secondary"
                  >
                    {variation.name}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </Link>

      <footer className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2">
          <Select
            defaultValue={cartProduct.quantity.toString()}
            onValueChange={(value) =>
              value === 'more'
                ? setIsQttOpen(true)
                : handleUpdateQuantity(value)
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 un.</SelectItem>
              <SelectItem value="2">2 un.</SelectItem>
              <SelectItem value="3">3 un.</SelectItem>
              <SelectItem value="4">4 un.</SelectItem>
              <SelectItem value="5">5 un.</SelectItem>
              <SelectItem value="6">6 un.</SelectItem>
              <SelectItem value="more">
                {cartProduct.quantity > 6
                  ? cartProduct.quantity + ' un.'
                  : 'Mais de 6 un.'}
              </SelectItem>
            </SelectContent>
          </Select>
          <Link
            href={createPath(
              `/${product.product_url}?cart_product_id=${cartProduct.id}`,
              storeSubdomain,
            )}
            className={buttonVariants({ variant: 'outline', size: 'icon' })}
          >
            <Edit className="w-4 h-4" />
          </Link>
          <Button variant="outline" size="icon" onClick={handleDeleteFromCart}>
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Drawer open={isQttOpen} onOpenChange={setIsQttOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Informe uma quantidade</DrawerTitle>
              <DrawerDescription>{product.stock} disponíveis</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-1">
              <Input
                type="number"
                placeholder="Digite a quantidade"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button onClick={() => handleUpdateQuantity(amount)}>
                  Confirmar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <div className="leading-4 flex flex-col ml-auto items-end">
          <p
            className={cn(
              'font-bold text-primary text-sm',
              cartProduct.product_price > 0 && 'font-light text-xs',
            )}
          >
            {formatCurrencyBRL(totalPrice * cartProduct.quantity)}
          </p>
        </div>
      </footer>
    </div>
  )
}
