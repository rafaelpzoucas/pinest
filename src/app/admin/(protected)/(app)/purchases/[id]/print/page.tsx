import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { readPurchaseById } from '../actions'
import { Printer } from './printer'

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
    card: 'Cartão',
    pix: 'PIX',
    cash: 'Dinheiro',
  }

  const purchaseItemsPrice =
    purchase?.purchase_items.reduce((acc, item) => {
      // Calculando o total do item (produto base)
      const itemTotal = item.product_price

      // Calculando o total dos extras
      const extrasTotal = item.extras.reduce((accExtra, extra) => {
        return accExtra + extra.price * extra.quantity
      }, 0)

      // Somando o total do item com o total dos extras
      return (acc + itemTotal + extrasTotal) * item.quantity
    }, 0) ?? 0

  if (!purchase) {
    return null
  }

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
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
          {purchase.purchase_items.map((item) => {
            // Calculando o total do item (produto base)
            const itemTotal = item.product_price

            // Calculando o total dos extras
            const extrasTotal = item.extras.reduce((acc, extra) => {
              return acc + extra.price * extra.quantity
            }, 0)

            // Somando o total do item com o total dos extras
            const total = (itemTotal + extrasTotal) * item.quantity

            return (
              <li
                key={item.id}
                className="border-b border-dotted last:border-0 py-2 print-section"
              >
                <div className="flex flex-row items-start justify-between">
                  <span>
                    {item.quantity} un. {item.products.name}
                  </span>
                  <span>{formatCurrencyBRL(item.product_price)}</span>
                </div>
                {item.extras.length > 0 &&
                  item.extras.map((extra) => (
                    <p className="flex flex-row items-center justify-between line-clamp-2 w-full">
                      <span className="flex flex-row items-center">
                        <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                        {extra.name}
                      </span>
                      <span>
                        {formatCurrencyBRL(extra.price * extra.quantity)}
                      </span>
                    </p>
                  ))}

                {item.observations && (
                  <strong className="uppercase">
                    obs: {item.observations}
                  </strong>
                )}

                <footer className="flex flex-row items-center justify-between">
                  <p>Total:</p>
                  <span>{formatCurrencyBRL(total)}</span>{' '}
                  {/* Exibindo o total calculado */}
                </footer>
              </li>
            )
          })}
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
        <strong className="flex flex-row items-center justify-between uppercase">
          <span>Total do pedido:</span>{' '}
          <span>{formatCurrencyBRL(purchase.total_amount)}</span>
        </strong>
      </div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid"
      >
        <div className="flex flex-row items-center justify-between">
          <h3 className="uppercase">Pagamento</h3>

          <strong className="uppercase border px-2 py-1">
            {PAYMENT_TYPES[purchase.payment_type as keyof typeof PAYMENT_TYPES]}
          </strong>
        </div>

        {purchase.change_value > 0 && (
          <p className="flex flex-row items-center justify-between font-bold">
            <span>Troco:</span>{' '}
            <span>
              {formatCurrencyBRL(purchase.change_value - purchase.total_amount)}
            </span>
          </p>
        )}
      </div>

      <Printer />
    </div>
  )
}
