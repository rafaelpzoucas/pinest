import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Banknote, CreditCard, DollarSign, MapPin } from 'lucide-react'

import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { ShippingConfigType } from '@/models/shipping'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { getCart } from '../../cart/actions'
import { CartProduct } from '../../cart/cart-product'
import { readStoreAddress } from '../actions'
import { readAddressById } from './actions'
import { Delivery } from './delivery'

function CheckoutButton({
  totalAmount,
  storeName,
  addressId,
  shipping,
  pickup,
  reference,
  shippingPrice,
  transp,
  payment,
  changeValue,
}: {
  totalAmount: number
  storeName: string
  addressId: string
  shipping: ShippingConfigType | null
  pickup: string
  reference: string
  shippingPrice: number
  transp: string
  payment: string
  changeValue: string
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
  const qPayment = payment ? `&payment=${payment}` : ''
  const qChange = changeValue ? `&changeValue=${changeValue}` : ''

  const query = `checkout/create?${qTotalAmount}${qStoreName}${qAddressId}${pickup !== 'pickup' ? qShippingPrice + qShippingTime : ''}${qPickup}${qTransp}${qReference}${qPayment}${qChange}`

  return (
    <Link href={query} className={cn(buttonVariants(), 'w-full')}>
      Finalizar pedido
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
    payment: string
    change: string
    changeValue: string
  }
}) {
  const addressId = searchParams.address
  const shippingCost = searchParams.shippingPrice
  const transp = searchParams.transp
  const payment = searchParams.payment
  const pickup = searchParams.pickup
  const changeValue = searchParams.changeValue

  const PAYMENT_METHODS = {
    card: {
      label: 'com cartão',
      description: 'Você poderá pagar com um cartão de crédito ou débito.',
    },
    cash: {
      label: 'no momento da entrega',
      description: `Você deverá efetuar o pagamento no momento da ${pickup === 'delivery' ? 'entrega.' : 'retirada.'}`,
    },
    pix: {
      label: 'com PIX',
      description: 'A chave PIX da loja é: 456789123456',
    },
  }

  const paymentKey = payment as keyof typeof PAYMENT_METHODS

  const { cart } = await getCart(params.public_store)
  const { address } = await readAddressById(addressId)
  const { storeAddress } = await readStoreAddress(params.public_store)
  const { shipping } = await readOwnShipping(params.public_store)

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

  const shippingPrice =
    pickup === 'delivery'
      ? parseFloat(shippingCost) || (shipping?.price ?? 0)
      : 0

  const totalPrice = shipping?.price
    ? productsPrice + shippingPrice
    : productsPrice

  const formattedAddress = storeAddress && formatAddress(storeAddress)

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
          payment={searchParams.payment}
          changeValue={changeValue}
        />
      </Card>

      {searchParams.pickup !== 'pickup' && (
        <Delivery customerAddress={address} />
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

          {formattedAddress && (
            <Link
              href={`https://www.google.com/maps?q=${formattedAddress.replaceAll(' ', '+')}`}
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              Ver localização
            </Link>
          )}
        </section>
      )}

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        {payment === 'card' && <CreditCard />}
        {payment === 'cash' && <Banknote />}
        {payment === 'pix' && <DollarSign />}
        <p>
          Você pagará {formatCurrencyBRL(totalPrice)}{' '}
          {PAYMENT_METHODS[paymentKey].label}
        </p>
        <span className="text-xs text-muted-foreground">
          {PAYMENT_METHODS[paymentKey].description}
        </span>

        <Link
          href={`/${params.public_store}/checkout?step=payment&pickup=${searchParams.pickup}${searchParams.address ? '&address=' + searchParams.address : ''}`}
          className={cn(buttonVariants({ variant: 'link' }))}
        >
          Alterar meio de pagamento
        </Link>
      </section>

      {/* <section className="flex flex-col items-center gap-2 text-center border-b py-6">
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
        {cart && cart.map((item) => <CartProduct cartProduct={item} />)}
      </section>
    </div>
  )
}
