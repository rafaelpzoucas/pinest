'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ProductType } from '@/models/product'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { addToCart } from '../../cart/actions'

type AddToCardDrawerProps = {
  product: ProductType
  publicStore: string
}

export function AddToCard({ product, publicStore }: AddToCardDrawerProps) {
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
    }
    await addToCart(publicStore, newCartProduct)

    router.push(`/${publicStore}/cart`)
  }

  return (
    <div className="flex flex-row gap-4 w-full">
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
      <Button
        className="flex flex-row items-center justify-between w-full max-w-md"
        onClick={handleAddToCart}
      >
        <span className="flex flex-row items-center gap-1">
          <Plus className="w-4 h-4" /> Adicionar{' '}
        </span>
        <span>{formatCurrencyBRL(totalPrice)}</span>
      </Button>
    </div>
  )
}
