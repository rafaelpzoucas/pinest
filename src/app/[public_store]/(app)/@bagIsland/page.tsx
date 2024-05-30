import { Card } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { ShoppingBag as Bag } from 'lucide-react'
import Link from 'next/link'
import { getCart } from '../../cart/actions'

export default async function ShoppingBag({
  params,
}: {
  params: { public_store: string }
}) {
  const products: CartProductType[] = await getCart()

  const bagPrice = products.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd * bagItem.amount
  }, 0)

  if (products && products.length === 0) {
    return null
  }

  return (
    <Link href={`${params.public_store}/cart`}>
      <Card className="flex flex-row items-center gap-3 p-3 w-full text-sm bg-primary text-primary-foreground">
        <Bag className="w-5 h-5" />
        <strong>Ver sacola ({products.length})</strong>

        <strong className="ml-auto">{formatCurrencyBRL(bagPrice)}</strong>
      </Card>
    </Link>
  )
}
