import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ProductCard } from '../../(app)/components/product-card'
import { createPurchase } from './actions'

function CheckoutButton({
  totalAmount,
  storeName,
  addressId,
}: {
  totalAmount: number
  storeName: string
  addressId: string
}) {
  async function handleCreatePurchase() {
    'use server'
    await createPurchase(totalAmount, storeName, addressId)
  }

  return (
    <form action={handleCreatePurchase} className="w-full">
      <Button type="submit" className="w-full">
        Continuar para o pagamento
      </Button>
    </form>
  )
}

export default async function SummaryLoading() {
  return (
    <div className="flex flex-col w-full">
      <Card className="flex flex-col p-4 w-full space-y-2">
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>
            Produtos (<Skeleton className="w-4 h-4" />)
          </p>
          <Skeleton className="w-24 h-3" />
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>Frete</p>
          <Skeleton className="w-24 h-4" />
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <Skeleton className="w-full h-4" />
        </div>

        <div className="flex flex-row justify-between text-sm pb-2">
          <p>Total</p>
          <Skeleton className="w-full h-4" />
        </div>

        <Skeleton className="w-full h-9" />
      </Card>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <Skeleton className="w-5 h-5" />

        <Skeleton className="w-full h-4" />

        <Skeleton className="w-full h-3" />
        <Skeleton className="w-36 h-3" />

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Editar ou escolher outro
        </Link>
      </section>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <Skeleton className="w-5 h-5" />

        <Skeleton className="w-full h-4" />

        <Skeleton className="w-full h-3" />
        <Skeleton className="w-36 h-3" />

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Editar ou escolher outro
        </Link>
      </section>

      <section className="flex flex-col items-start gap-2 py-6">
        <ProductCard variant={'bag_items'} className="w-full" />
        <ProductCard variant={'bag_items'} className="w-full" />
        <ProductCard variant={'bag_items'} className="w-full" />
      </section>
    </div>
  )
}
