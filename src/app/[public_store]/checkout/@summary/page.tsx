import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

import { ProductCard } from '@/components/product-card'
import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { ShippingConfigType } from '@/models/shipping'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { getCart } from '../../cart/actions'
import { readStoreAddress } from '../actions'
import { readAddressById } from './actions'

function CheckoutButton({
  totalAmount,
  storeName,
  addressId,
  shipping,
  pickup,
  reference,
  shippingPrice,
  transp,
}: {
  totalAmount: number
  storeName: string
  addressId: string
  shipping: ShippingConfigType | null
  pickup: string
  reference: string
  shippingPrice: number
  transp: string
}) {
  const shippingCost =
    (shippingPrice && `&shippingPrice=${shippingPrice}`) ?? shipping?.price

  const qTotalAmount = `totalAmount=${totalAmount}`
  const qStoreName = `&storeName=${storeName}`
  const qAddressId = addressId ? `&addressId=${addressId}` : ''
  const qShippingPrice =
    shippingCost ??
    (shipping && shipping.status ? `&shippingPrice=${shipping.price}` : '')
  const qShippingTime =
    shipping && shipping.status ? `&shippingTime=${shipping.delivery_time}` : ''
  const qPickup = `&pickup=${pickup}`
  const qReference = transp ? `&reference=${reference}` : ''
  const qTransp = transp ? `&transp=${transp}` : ''

  const query = `checkout/create?${qTotalAmount}${qStoreName}${qAddressId}${pickup !== 'pickup' ? qShippingPrice + qShippingTime : ''}${qPickup}${qTransp}${qReference}`

  return (
    <Link href={query} className={cn(buttonVariants(), 'w-full')}>
      Continuar para o pagamento
    </Link>
  )
}

export default async function Summary({
  params,
  searchParams,
}: {
  params: { public_store: string }
  searchParams: {
    address: string
    pickup: string
    reference: string
    shippingPrice: string
    transp: string
  }
}) {
  const addressId = searchParams.address
  const shippingCost = searchParams.shippingPrice
  const transp = searchParams.transp

  const { cart } = await getCart(params.public_store)
  const { address } = await readAddressById(addressId)
  const { storeAddress } = await readStoreAddress(params.public_store)
  const { shipping } = await readOwnShipping(params.public_store)

  const productsPrice = cart
    ? cart.reduce((acc, cartProduct) => {
        const priceToAdd = cartProduct.product_price

        return acc + priceToAdd * cartProduct.quantity
      }, 0)
    : 0

  const shippingPrice = parseFloat(shippingCost) || (shipping?.price ?? 0)

  const totalPrice = shipping?.price
    ? productsPrice + shippingPrice
    : productsPrice

  return (
    <div className="flex flex-col w-full">
      <Card className="flex flex-col p-4 w-full space-y-2">
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>Produtos ({cart ? cart.length : 0})</p>
          <span>{formatCurrencyBRL(productsPrice)}</span>
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>
            {searchParams.pickup !== 'pickup' ? 'Frete' : 'Retirar'}
            <strong>{transp ? ` por ${transp}` : ''}</strong>
          </p>
          {searchParams.pickup !== 'pickup' && shipping && (
            <span>{formatCurrencyBRL(shippingPrice)}</span>
          )}
          {searchParams.pickup === 'pickup' && shipping && (
            <span className="text-emerald-600">Grátis</span>
          )}
        </div>

        <div className="flex flex-row justify-between text-sm pb-2">
          <p>Total</p>
          <strong>{formatCurrencyBRL(totalPrice)}</strong>
        </div>

        <CheckoutButton
          storeName={params.public_store}
          totalAmount={totalPrice}
          addressId={searchParams.address}
          shipping={shipping}
          pickup={searchParams.pickup}
          shippingPrice={shippingPrice}
          reference={searchParams.reference}
          transp={searchParams.transp}
        />
      </Card>

      {searchParams.pickup !== 'pickup' && (
        <section className="flex flex-col items-center gap-2 text-center border-b py-6">
          <MapPin />
          <p>
            {address?.street}, {address?.number}
          </p>
          <span className="text-xs text-muted-foreground">
            CEP {address?.zip_code} - {address?.neighborhood} - {address?.city}/
            {address?.state}
          </span>

          <Link
            href={`/${params.public_store}/checkout?step=pickup`}
            className={cn(buttonVariants({ variant: 'link' }))}
          >
            Editar ou escolher outro
          </Link>
        </section>
      )}

      {searchParams.pickup === 'pickup' && (
        <section className="flex flex-col items-center gap-2 text-center border-b py-6">
          <MapPin />
          <p>Retirar na loja</p>

          <p>
            {storeAddress?.street}, {storeAddress?.number}
          </p>

          <span className="text-xs text-muted-foreground">
            CEP {storeAddress?.zip_code} - {storeAddress?.neighborhood} -{' '}
            {storeAddress?.city}/{storeAddress?.state}
          </span>

          {storeAddress && (
            <Link
              href={`https://www.google.com/maps?q=${formatAddress(storeAddress).replaceAll(' ', '+')}`}
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              Ver localização
            </Link>
          )}
        </section>
      )}

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
        {cart &&
          cart.map((item) => (
            <ProductCard
              key={item.id}
              data={item.products}
              publicStore={params.public_store}
              variant={'bag_items'}
              className="w-full"
            />
          ))}
      </section>
    </div>
  )
}
