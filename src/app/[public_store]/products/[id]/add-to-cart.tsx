'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

import { Card } from '@/components/ui/card'
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
      product_id: product.id,
      products: product,
      quantity: amount,
    }
    await addToCart(publicStore, newCartProduct)

    router.push(`/${publicStore}`)
  }

  if (product.stock > 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Quantidade em estoque: {product.stock}
        </p>

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
            <Button
              variant={'secondary'}
              size={'icon'}
              onClick={increase}
              disabled={amount === product.stock}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            className="flex flex-row items-center justify-between w-full max-w-md"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <span className="flex flex-row items-center gap-1">
              <Plus className="w-4 h-4" /> Adicionar{' '}
            </span>
            <span>{formatCurrencyBRL(totalPrice)}</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="space-y-2 p-4 border-0 bg-secondary/30">
      <h1 className="text-2xl font-bold">Produto indisponível</h1>
      <p className="text-sm text-muted-foreground">
        Este produto está indisponível no momento, por falta de estoque.
      </p>
    </Card>
  )
}
