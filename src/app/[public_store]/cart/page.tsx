import { Header } from '@/components/store-header'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, createPath, formatCurrencyBRL } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { readCustomer } from '../account/actions'
import { readStore } from '../actions'
import { readCart } from './actions'
import { CartProducts } from './cart-products'

export default async function CartPage() {
  const [[customerData], [storeData], [cartData]] = await Promise.all([
    readCustomer({}),
    readStore(),
    readCart(),
  ])

  const store = storeData?.store
  const cart = cartData?.cart
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

            {!customer ? (
              <Link
                href={createPath(
                  '/account?checkout=true',
                  store?.store_subdomain,
                )}
                className={cn(buttonVariants(), 'w-full')}
              >
                Finalizar compra
              </Link>
            ) : (
              <Link
                href={createPath(
                  '/checkout?step=pickup',
                  store?.store_subdomain,
                )}
                className={cn(buttonVariants(), 'w-full')}
              >
                Finalizar compra
              </Link>
            )}
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
