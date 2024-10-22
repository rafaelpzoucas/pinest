'use client'

import { Button } from '@/components/ui/button'
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
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { removeFromCart, updateCartProductQuantity } from './actions'

type CartProductPropsType = {
  cartProduct: CartProductType
  publicStore: string
}

export function CartProduct({
  publicStore,
  cartProduct,
}: CartProductPropsType) {
  const [isQttOpen, setIsQttOpen] = useState(false)
  const [amount, setAmount] = useState('')

  const product = cartProduct.products

  function handleUpdateQuantity(quantity: string) {
    if (cartProduct && cartProduct.id) {
      updateCartProductQuantity(cartProduct.id, parseInt(quantity))
    }
  }

  function handleDeleteFromCart() {
    if (cartProduct && cartProduct.id) {
      removeFromCart(cartProduct.id)
    }
  }

  return (
    <div className="flex flex-col gap-2 py-2 border-b last:border-0">
      <div className="flex flex-row gap-4">
        <p className="line-clamp-2 max-w-56">{product.name}</p>
      </div>

      <footer className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2">
          <Button variant="outline" size="icon" onClick={handleDeleteFromCart}>
            <Trash className="w-4 h-4" />
          </Button>
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
            {formatCurrencyBRL(
              cartProduct.product_price * cartProduct.quantity,
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
