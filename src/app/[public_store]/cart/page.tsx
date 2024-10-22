import { Header } from '@/components/store-header'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getCart, readStripeConnectedAccountByStoreUrl } from './actions'
import { CartProducts } from './cart-products'

export default async function CartPage({
  params,
}: {
  params: { public_store: string }
}) {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()
  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const connectedAccount = user?.stripe_connected_account

  const { cart } = await getCart(params.public_store)

  const productsPrice = cart
    ? cart.reduce((acc, cartProduct) => {
        const priceToAdd = cartProduct.product_price

        return acc + priceToAdd * cartProduct.quantity
      }, 0)
    : 0

  return (
    <main className="w-full space-y-4 pb-40">
      <Header title="Finalizar compra" />

      {connectedAccount && productsPrice > 0 && (
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

            {!userData.user ? (
              <Link
                href={`/${params.public_store}/sign-in`}
                className={cn(buttonVariants(), 'w-full')}
              >
                Finalizar compra
              </Link>
            ) : (
              <Link
                href={`/${params.public_store}/checkout?step=pickup`}
                className={cn(buttonVariants(), 'w-full')}
              >
                Finalizar compra
              </Link>
            )}
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-2 w-full">
        <CartProducts cartProducts={cart} storeName={params.public_store} />

        <Link
          href={`/${params.public_store}`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar itens
        </Link>
      </section>
    </main>
  )
}
