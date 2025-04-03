import { Header } from '@/components/store-header'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { readCart, readStripeConnectedAccountByStoreUrl } from './actions'
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

  const [cartData] = await readCart()

  const cart = cartData?.cart

  const cookiesStore = await cookies()
  const guest = cookiesStore.get('guest_data')
  const guestData = guest && JSON.parse(guest.value)

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

            {!userData.user && !guestData ? (
              <Link
                href={`/${params.public_store}/sign-in?checkout=true`}
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
        <Link
          href={`/${params.public_store}`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar itens
        </Link>

        <CartProducts cartProducts={cart} />
      </section>
    </main>
  )
}
