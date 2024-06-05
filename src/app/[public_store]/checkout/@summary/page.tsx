import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DollarSign, MapPin, ScrollText } from 'lucide-react'

import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import Link from 'next/link'
import { getCart } from '../../cart/actions'
import { createStripeCheckout } from '../actions'

function CheckoutButton({ storeName }: { storeName: string }) {
  async function handleCreateStripeCheckout() {
    'use server'
    await createStripeCheckout(storeName)
  }

  return (
    <form action={handleCreateStripeCheckout} className="w-full">
      <Button type="submit" className="w-full">
        Continuar para o pagamento
      </Button>
    </form>
  )
}

export default async function Confirm({
  params,
}: {
  params: { public_store: string }
}) {
  const bagItems: CartProductType[] = await getCart()

  const productsPrice = bagItems.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd * bagItem.amount
  }, 0)

  return (
    <div className="flex flex-col">
      <Card className="flex flex-col p-4 w-full space-y-2">
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

        <CheckoutButton storeName={params.public_store} />
      </Card>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <MapPin />
        <p>Rua Santa Cruz, 801</p>
        <span className="text-xs text-muted-foreground">
          CEP 19800-320 - Centro - Assis, São Paulo
        </span>

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Editar ou escolher outro
        </Link>
      </section>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <DollarSign />
        <p>Você pagará {formatCurrencyBRL(100)} com Pix</p>
        <span className="text-xs text-muted-foreground">
          Os pagamentos com este meio são aprovados na hora
        </span>

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Alterar meio de pagamento
        </Link>
      </section>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <ScrollText />
        <p>Dados para Nota Fiscal eletrônica</p>
        <span className="text-xs text-muted-foreground">
          Rafael Ricardo Pinheiro Zoucas - CPF 46651341898
        </span>

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Alterar dados
        </Link>
      </section>

      <CheckoutButton storeName={params.public_store} />
    </div>
  )
}
