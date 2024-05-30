'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Minus, Plus } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ProductType } from '@/models/product'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProductCard } from '../../(app)/components/product-card'
import { addToCart } from '../../cart/actions'

type AddToCardDrawerProps = {
  product: ProductType
  publicStore: string
}

export function AddToCardDrawer({
  product,
  publicStore,
}: AddToCardDrawerProps) {
  const router = useRouter()

  const [amount, setAmount] = useState(1)

  const totalPrice = product.price * amount

  function increase() {
    setAmount((prev) => prev + 1)
  }

  function decrease() {
    if (amount > 1) {
      setAmount((prev) => prev - 1)
    }
  }

  async function handleAddToCart() {
    const newCartProduct: CartProductType = {
      ...product,
      amount,
      observations: '',
    }
    await addToCart(newCartProduct)
    router.back()
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ao carrinho
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col gap-6 px-4 pt-5">
          <section className="flex flex-row gap-2 items-center justify-between">
            <ProductCard
              variant={'bag_items'}
              data={product}
              publicStore={publicStore}
            />
          </section>

          <Input placeholder="Escreva suas observações..." />
        </div>

        <DrawerFooter className="flex flex-row gap-4">
          <div className="flex flex-row items-center gap-3">
            <Button
              variant={'secondary'}
              size={'icon'}
              onClick={decrease}
              disabled={amount === 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="text"
              readOnly
              className="text-center w-5 bg-transparent"
              value={amount}
            />
            <Button variant={'secondary'} size={'icon'} onClick={increase}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <DrawerClose asChild>
            <Button
              className="flex flex-row items-center justify-between w-full"
              onClick={handleAddToCart}
            >
              Adicionar <span>{formatCurrencyBRL(totalPrice)}</span>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
