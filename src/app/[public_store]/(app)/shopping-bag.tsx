'use client'

import { Card } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ShoppingBag as Bag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ShoppingBag({ products }: { products: CartProductType[] }) {
  const pathname = usePathname()

  const bagPrice = products.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd
  }, 0)

  return (
    <Link href={`${pathname}/cart`}>
      <Card className="flex flex-row items-center gap-3 p-3 w-full text-sm bg-primary text-primary-foreground">
        <Bag className="w-5 h-5" />
        <strong>Ver sacola ({products.length})</strong>

        <strong className="ml-auto">{formatCurrencyBRL(bagPrice)}</strong>
      </Card>
    </Link>
  )
}
