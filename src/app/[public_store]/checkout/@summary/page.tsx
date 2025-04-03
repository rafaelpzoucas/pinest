import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Banknote, CreditCard, DollarSign, MapPin } from 'lucide-react'

import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { readCart } from '../../cart/actions'
import { CartProduct } from '../../cart/cart-product'
import { readStore, readStoreAddress } from '../actions'
import { readAddressById } from './actions'
import { CheckoutButton } from './checkout-button'
import { Delivery } from './delivery'

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
  const { store } = await readStore(params.public_store)

  const PAYMENT_METHODS = {
    CREDIT: {
      label: 'com cartão de crédito',
      description: 'Você poderá pagar com um cartão de crédito.',
    },
    DEBIT: {
      label: 'com cartão de débito',
      description: 'Você poderá pagar com um cartão de débito.',
    },
    CASH: {
      label: 'em dinheiro',
      description: `Você deverá efetuar o pagamento no momento da ${pickup === 'DELIVERY' ? 'entrega.' : 'retirada.'}`,
    },
    PIX: {
      label: 'com PIX',
      description: store?.pix_key
        ? `A chave PIX da loja é: ${store?.pix_key}`
        : 'Solicite a chave PIX para a loja.',
    },
  }

  const paymentKey = payment as keyof typeof PAYMENT_METHODS

  const [cartData] = await readCart()
  const cart = cartData?.cart
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
    pickup === 'DELIVERY'
      ? parseFloat(shippingCost) || (shipping?.price ?? 0)
      : 0

  const totalPrice = shipping?.price
    ? productsPrice + shippingPrice
    : productsPrice

  const formattedAddress = storeAddress && formatAddress(storeAddress)

  const createPurchaseValues = {
    addressId:
      searchParams.address === 'guest' ? undefined : searchParams.address,
    type: searchParams.pickup,
    payment_type: searchParams.payment,
    totalAmount: totalPrice,
    shippingPrice,
    shippingTime: shipping && shipping.status ? shipping.delivery_time : 0,
    changeValue: parseFloat(searchParams.changeValue ?? 0),
  }

  return (
    <div className="flex flex-col w-full">
      <Card className="flex flex-col p-4 w-full space-y-2">
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>Produtos ({cart ? cart.length : 0})</p>
          <span>{formatCurrencyBRL(productsPrice)}</span>
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>
            {searchParams.pickup !== 'TAKEOUT' ? 'Frete' : 'Retirar'}
            <strong>{transp ? ` por ${transp}` : ''}</strong>
          </p>
          {searchParams.pickup !== 'TAKEOUT' && shipping && (
            <span>{formatCurrencyBRL(shippingPrice)}</span>
          )}
          {searchParams.pickup === 'TAKEOUT' && shipping && (
            <span className="text-emerald-600">Grátis</span>
          )}
        </div>

        <div className="flex flex-row justify-between text-sm pb-2">
          <p>Total</p>
          <strong>{formatCurrencyBRL(totalPrice)}</strong>
        </div>

        <CheckoutButton values={createPurchaseValues} />
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
