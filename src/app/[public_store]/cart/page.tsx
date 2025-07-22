'use client'

import { readCustomer } from '@/actions/client/app/public_store/cart/customer'
import { readStoreData } from '@/actions/client/app/public_store/readStore'
import { Header } from '@/components/store-header'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, createPath, formatCurrencyBRL } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CartProducts } from './cart-products'
import CartPageLoading from './loading'

export default function CartPage() {
  const { cart } = useCartStore()

  const { data: storeData, isLoading: isLoadingStore } = useQuery({
    queryKey: ['store'],
    queryFn: () => readStoreData(),
  })

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer'],
    queryFn: () => readCustomer({}),
  })

  const store = storeData?.store
  const customer = customerData?.customer

  const productsPrice = cart
    ? cart.reduce((acc, cartProduct) => {
        const productTotal = cartProduct.product_price

        const extrasTotal =
          cartProduct.extras?.reduce(
            (sum, extra) => sum + extra.price * extra.quantity,
            0,
          ) || 0

        return (acc + productTotal + extrasTotal) * cartProduct.quantity
      }, 0)
    : 0

  const finishPurchaseLink = !customer
    ? createPath('/account?checkout=true', store?.store_subdomain)
    : createPath('/checkout?step=pickup', store?.store_subdomain)

  if (isLoadingStore || isLoadingCustomer) {
    return <CartPageLoading />
  }

  return (
    <main className="w-full space-y-4 pb-40">
      <Header title="Finalizar compra" />

      {productsPrice > 0 && (
        <section className="flex flex-col gap-2 w-full max-w-2xl">
          <Card className="p-4 w-full space-y-2">
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Produtos ({cart?.length})</p>
              <span>{formatCurrencyBRL(productsPrice)}</span>
            </div>

            <div className="flex flex-row justify-between text-sm pb-2">
              <p>Total</p>
              <strong>{formatCurrencyBRL(productsPrice - 0)}</strong>
            </div>

            <Link
              href={finishPurchaseLink}
              className={cn(buttonVariants(), 'w-full')}
            >
              Finalizar compra
            </Link>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-2 w-full">
        <Link
          href={createPath('/', store?.store_subdomain)}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar itens
        </Link>

        <CartProducts cartProducts={cart} store={store} />
      </section>
    </main>
  )
}
