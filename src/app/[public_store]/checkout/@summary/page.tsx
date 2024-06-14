import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import Link from 'next/link'
import { ProductCard } from '../../(app)/components/product-card'
import { getCart } from '../../cart/actions'
import { createPurchase, readAddressById } from './actions'

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

export default async function Summary({
  params,
  searchParams,
}: {
  params: { public_store: string }
  searchParams: { address: string }
}) {
  const addressId = searchParams.address

  const bagItems: CartProductType[] = await getCart()
  const { address } = await readAddressById(addressId)

  const productsPrice = bagItems.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd * bagItem.amount
  }, 0)

  return (
    <div className="flex flex-col w-full">
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

        <CheckoutButton
          storeName={params.public_store}
          totalAmount={productsPrice}
          addressId={searchParams.address}
        />
      </Card>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <MapPin />
        <p>
          {address?.street}, {address?.number}
        </p>
        <span className="text-xs text-muted-foreground">
          CEP {address?.zip_code} - {address?.neighborhood} - {address?.city}/
          {address?.state}
        </span>

        <Link href="" className={cn(buttonVariants({ variant: 'link' }))}>
          Editar ou escolher outro
        </Link>
      </section>

      {/* <section className="flex flex-col items-center gap-2 text-center border-b py-6">
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
      </section> */}

      <section className="flex flex-col items-start gap-2 py-6">
        {bagItems.map((item) => (
          <ProductCard
            key={item.id}
            data={item}
            publicStore={params.public_store}
            variant={'bag_items'}
            className="w-full"
          />
        ))}
      </section>

      <CheckoutButton
        storeName={params.public_store}
        totalAmount={productsPrice}
        addressId={searchParams.address}
      />
    </div>
  )
}
