import { buttonVariants } from '@/components/ui/button'
import { Banknote, CreditCard, DollarSign, MapPin } from 'lucide-react'

import { CopyTextButton } from '@/components/copy-text-button'
import { cn, createPath, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { readCustomerCached } from '../../account/actions'
import { readStoreCached } from '../../actions'
import { readCartCached } from '../../cart/actions'
import { CartProduct } from '../../cart/cart-product'
import { CouponField } from './coupon-field'
import { Delivery } from './delivery'
import { SummaryCard } from './summary-card'

export default async function Summary({
  searchParams,
}: {
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
  const shippingCost = searchParams.shippingPrice
  const transp = searchParams.transp
  const pickup = searchParams.pickup?.toUpperCase()
  const payment = searchParams.payment?.toUpperCase()
  const changeValue = parseFloat(searchParams.changeValue)

  const [[storeData], [cartData], [ownShippingData], [customerData]] =
    await Promise.all([
      readStoreCached(),
      readCartCached(),
      readOwnShipping(),
      readCustomerCached({}),
    ])

  const store = storeData?.store
  const storeAddress = store?.addresses[0]
  const cart = cartData?.cart
  const shipping = ownShippingData?.shipping
  const customerAddress = customerData?.customer?.address

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
      label: `em dinheiro ${changeValue ? ' - troco para ' + formatCurrencyBRL(changeValue) : ''}`,
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

  // --- Cupom de desconto (client component) ---
  // O campo será renderizado acima do resumo do total
  // Estado do desconto aplicado
  // Função para calcular o total com desconto
  // (tudo isso será movido para o componente client)

  return (
    <div className="flex flex-col w-full">
      <SummaryCard
        cart={cart}
        shipping={shipping}
        shippingCost={shippingCost}
        pickup={pickup}
        payment={payment}
        transp={transp}
        totalPrice={totalPrice}
        store={store}
        searchParams={searchParams}
      />

      <CouponField />

      {searchParams.pickup !== 'pickup' && (
        <Delivery customerAddress={customerAddress} store={store} />
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
        {payment === 'CREDIT' && <CreditCard />}
        {payment === 'DEBIT' && <CreditCard />}
        {payment === 'CASH' && <Banknote />}
        {payment === 'PIX' && <DollarSign />}
        <p>Você pagará {PAYMENT_METHODS[paymentKey]?.label}</p>
        {paymentKey === 'PIX' && store?.pix_key ? (
          <div>
            <CopyTextButton
              textToCopy={store?.pix_key}
              buttonText="Chave PIX"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            {PAYMENT_METHODS[paymentKey]?.description}
          </span>
        )}

        <Link
          href={createPath(
            `/checkout?step=payment&pickup=${searchParams.pickup}${searchParams.address ? '&address=' + searchParams.address : ''}`,
            store?.store_subdomain,
          )}
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
        {cart &&
          cart.map((item) => (
            <CartProduct
              cartProduct={item}
              storeSubdomain={store?.store_subdomain}
            />
          ))}
      </section>
    </div>
  )
}
