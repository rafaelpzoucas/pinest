import { Header } from '@/components/header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
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

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const bagItems: CartProductType[] = await getCart(params.public_store)

  const productsPrice = bagItems.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd * bagItem.amount
  }, 0)

  return (
    <main className="w-full space-y-4 pb-40">
      <Header title="Finalizar compra" />

      <section className="flex flex-col gap-2 w-full max-w-2xl">
        <Card className="p-4 w-full space-y-2">
          <div className="flex flex-row justify-between text-xs text-muted-foreground">
            <p>Produtos ({bagItems.length})</p>
            <span>{formatCurrencyBRL(productsPrice)}</span>
          </div>

          <div className="flex flex-row justify-between text-xs text-muted-foreground">
            <p>Frete</p>
            <span className="text-emerald-600">Grátis</span>
          </div>

          <div className="flex flex-row justify-between text-xs text-muted-foreground">
            <Button variant={'link'} className="p-0">
              Inserir cupom
            </Button>
          </div>

          <div className="flex flex-row justify-between text-sm pb-2">
            <p>Total</p>
            <strong>{formatCurrencyBRL(productsPrice - 0)}</strong>
          </div>

          {user?.stripe_connected_account &&
            user.stripe_connected_account.data.length > 0 &&
            productsPrice > 0 &&
            (!userData.user ? (
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
            ))}
        </Card>
      </section>

      <section className="flex flex-col gap-2 w-full">
        <CartProducts bagItems={bagItems} storeName={params.public_store} />

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
