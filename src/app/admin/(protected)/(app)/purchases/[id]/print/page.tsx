import { redirect } from 'next/navigation'
import { readPurchaseById } from '../actions'
import { Printer } from './printer'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { format } from 'date-fns'

export default async function PrintPurchase({
  params,
}: {
  params: { id: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) {
    throw new Error(purchaseError)
  }

  const displayId = purchase?.id.substring(0, 4)

  const DELIVERY_TYPES = {
    pickup: 'Retirar na loja',
    delivery: 'Entregar',
  }

  const PAYMENT_TYPES = {
    card: 'Máquina de cartão',
    pix: 'PIX',
    cash: `Pagamento em dinheiro ${purchase?.change_value ? ', levar ' + purchase.change_value + ' de troco' : ''}` as string,
  }

  const purchaseItemsPrice =
    purchase?.purchase_items.reduce(
      (acc, item) => acc + item.product_price * item.quantity,
      0,
    ) ?? 0

  if (!purchase) {
    return null
  }

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-base text-black
        print-container"
    >
      <h1 className="uppercase">Pedido #{displayId}</h1>

      <h2 className="font-bold uppercase">
        {DELIVERY_TYPES[purchase.type as keyof typeof DELIVERY_TYPES]}
      </h2>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 break-inside-avoid
          print-section"
      >
        <p>
          Data do pedido: {format(purchase.created_at, 'dd/MM/yyyy - HH:mm:ss')}
        </p>
        <p>Cliente: {purchase.customers.users.name}</p>
        <p>Telefone: {purchase.customers.users.phone}</p>
        <p>Endereço: {formatAddress(purchase.addresses)}</p>
      </div>

      {/* Forçando uma nova página antes dos itens */}
      <div className="force-page-break"></div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid"
      >
        <h3 className="mx-auto uppercase">Itens do pedido</h3>

        <ul>
          {purchase.purchase_items.map((item) => (
            <li
              key={item.id}
              className="flex flex-row items-start justify-between border-b border-dotted last:border-0
                py-2 print-section"
            >
              <span>
                {item.quantity} un. {item.products.name}
              </span>
              <span>{formatCurrencyBRL(item.product_price)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid"
      >
        <h3 className="mx-auto uppercase">Total</h3>

        <p className="flex flex-row items-center justify-between">
          <span>Total dos itens:</span>{' '}
          <span>{formatCurrencyBRL(purchaseItemsPrice)}</span>
        </p>
        <p className="flex flex-row items-center justify-between">
          <span>Taxa de entrega:</span>{' '}
          <span>{formatCurrencyBRL(purchase.shipping_price)}</span>
        </p>
        <strong className="flex flex-row items-center justify-between">
          <span>Total do pedido:</span>{' '}
          <span>{formatCurrencyBRL(purchase.total_amount)}</span>
        </strong>
      </div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid"
      >
        <h3 className="mx-auto uppercase">Forma de pagamento</h3>

        <p className="flex flex-row items-center justify-between">
          <span>
            Cobrar do cliente na{' '}
            {purchase.type === 'delivery' ? 'entrega' : 'retirada'}:
          </span>{' '}
          <span>{formatCurrencyBRL(purchase.total_amount)}</span>
        </p>
        {purchase.change_value > 0 && (
          <p className="flex flex-row items-center justify-between">
            <span>Troco:</span>{' '}
            <span>
              {formatCurrencyBRL(purchase.change_value - purchase.total_amount)}
            </span>
          </p>
        )}
        <strong className="uppercase">
          {PAYMENT_TYPES[purchase.payment_type as keyof typeof PAYMENT_TYPES]}
        </strong>
      </div>

      <Printer />
    </div>
  )
}
