import { PAYMENT_TYPES, PurchaseType } from '@/models/purchase'
import { TableType } from '@/models/table'
import { format } from 'date-fns'

import { ProductsSoldReportType } from '@/app/admin/(protected)/(app)/reports/products-sold'
import { SalesReportType } from '@/app/admin/(protected)/(app)/reports/sales-report'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'

export function buildReceiptKitchenText(
  purchase?: PurchaseType,
  reprint = false,
) {
  if (!purchase) return ''

  const displayId = purchase?.display_id ?? purchase.id.substring(0, 4)
  const isIfood = purchase?.is_ifood

  const customer = isIfood
    ? purchase?.ifood_order_data.customer
    : purchase?.store_customers.customers

  const customerName = customer.name

  const itemsList = reprint
    ? purchase.purchase_items
    : purchase.purchase_items.filter((item) => !item.printed)

  let text = ''

  text += `${reprint ? 'REIMPRESSÃO - ' : ''}COZINHA\n`
  text += `PEDIDO #${displayId}\n`
  text += `${purchase.type}\n`

  text += `DATA: ${format(new Date(purchase.created_at), 'dd/MM HH:mm:ss')}\n`
  text += `CLIENTE: ${customerName.toUpperCase()}\n`

  if (purchase.observations) {
    text += `OBS: ${purchase.observations.toUpperCase()}\n`
  }

  text += `\n\nITENS DO PEDIDO:\n\n`

  if (!isIfood) {
    for (const item of itemsList) {
      if (!item.products) continue
      text += `${item.quantity}X ${item.products.name.toUpperCase()}\n`

      if (item.extras.length > 0) {
        for (const extra of item.extras) {
          text += `  + ${extra.quantity}X AD. ${extra.name.toUpperCase()}\n`
        }
      }

      if (item.observations && item.observations.length > 0) {
        for (const obs of item.observations) {
          text += `  * ${obs.toUpperCase()}\n`
        }
      }

      text += `----------------------\n\n`
    }
  } else {
    for (const item of purchase.ifood_order_data.items) {
      text += `${item.quantity}X ${item.name.toUpperCase()}\n`

      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          text += `  + ${option.quantity}X AD. ${option.name.toUpperCase()}\n`
        }
      }

      if (item.observations) {
        text += `  **${item.observations.toUpperCase()}\n`
      }

      text += `----------------------\n\n`
    }
  }

  text += `======================\n\n`

  return text.trim()
}

export function buildReceiptDeliveryText(
  purchase?: PurchaseType,
  reprint = false,
) {
  if (!purchase) return ''

  const isIfood = purchase?.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && purchase.ifood_order_data

  const customer = isIfood
    ? purchase?.ifood_order_data.customer
    : purchase?.store_customers.customers

  const customerName = customer.name
  const customerPhone = isIfood
    ? `${customer.phone.number} ID: ${customer.phone.localizer}`
    : customer.phone
  const customerAddress = isIfood
    ? (purchase.delivery.address as unknown as string)
    : formatAddress(purchase?.store_customers.customers.address)

  const displayId = isIfood
    ? ifoodOrder.displayId
    : (purchase?.display_id ?? purchase?.id.substring(0, 4))

  const deliveryType = {
    TAKEOUT: 'RETIRAR NA LOJA',
    DELIVERY: 'ENTREGAR',
  }[purchase.type]

  let text = ''

  text += `${reprint ? 'REIMPRESSÃO' : ''}\n`
  text += `PEDIDO #${displayId}\n`
  text += `${deliveryType}\n`

  text += `DATA: ${format(new Date(purchase.created_at), 'dd/MM HH:mm:ss')}\n`
  if (isIfood) {
    text += `ENTREGA: ${format(new Date(ifoodOrder.delivery.deliveryDateTime), 'dd/MM HH:mm:ss')}\n`
  }

  text += `CLIENTE: ${customerName.toUpperCase()}\n`
  text += `TELEFONE: ${String(customerPhone).toUpperCase()}\n`
  text += `ENDEREÇO: ${String(customerAddress).toUpperCase()}\n`

  if (purchase.observations || ifoodOrder?.delivery?.observations) {
    text += `OBS: ${(ifoodOrder?.delivery?.observations ?? purchase.observations).toUpperCase()}\n`
  }

  text += `\n\nITENS DO PEDIDO:\n\n`

  if (!isIfood) {
    for (const item of purchase.purchase_items) {
      if (!item.products) continue

      const itemTotal = item.product_price
      const extrasTotal = item.extras.reduce(
        (acc, extra) => acc + extra.price * extra.quantity,
        0,
      )
      const total = (itemTotal + extrasTotal) * item.quantity

      text += `${item.quantity}X ${item.products.name.toUpperCase()} - ${formatCurrencyBRL(total)}\n`

      for (const extra of item.extras) {
        text += `  + ${extra.quantity}X AD. ${extra.name.toUpperCase()} - ${formatCurrencyBRL(extra.price * extra.quantity)}\n`
      }

      for (const obs of item.observations ?? []) {
        text += `  * ${obs.toUpperCase()}\n`
      }

      text += `----------------------\n\n`
    }
  } else {
    for (const item of ifoodOrder.items) {
      text += `${item.quantity}X ${item.name.toUpperCase()}\n`

      for (const option of item.options ?? []) {
        text += `  + ${option.quantity}X AD. ${option.name.toUpperCase()}\n`
      }

      if (item.observations) {
        text += `  * ${item.observations.toUpperCase()}\n`
      }

      text += `----------------------\n\n`
    }
  }

  text += `======================\n\n`

  // Total do pedido
  const total = formatCurrencyBRL(purchase.total.total_amount)
  text += `TOTAL: ${total}\n\n`

  // Forma de pagamento
  if (purchase.payment_type) {
    const isIfood = purchase.is_ifood
    const ifoodOrder: IfoodOrder | undefined =
      isIfood && purchase.ifood_order_data

    let paymentLabel = ''
    if (isIfood) {
      if (ifoodOrder?.payments?.prepaid) {
        paymentLabel = 'PAGO ONLINE'
      } else {
        const brand =
          ifoodOrder?.payments?.methods?.[0]?.card?.brand?.toUpperCase()
        paymentLabel = brand ? `CARTÃO - ${brand}` : 'MÉTODO NÃO IDENTIFICADO'
      }
    } else {
      paymentLabel =
        PAYMENT_TYPES[
          purchase.payment_type as keyof typeof PAYMENT_TYPES
        ]?.toUpperCase() || 'INDEFINIDO'
    }

    text += `PAGAMENTO:\n${paymentLabel}\n\n`

    if (purchase.total.change_value > 0) {
      const troco = purchase.total.change_value - purchase.total.total_amount
      text += `TROCO PARA: ${formatCurrencyBRL(troco)}\n\n`
    }

    if (isIfood && ifoodOrder?.extraInfo) {
      text += `INFO ADICIONAL: ${ifoodOrder.extraInfo.toUpperCase()}\n\n`
    }
  }

  return text.trim()
}

export function buildReceiptTableText(
  table: TableType,
  reprint = false,
): string {
  const displayId = table.number
  const itemsList = reprint
    ? table.purchase_items
    : table.purchase_items.filter((item) => !item.printed)

  let text = ''
  text += `\n====== COZINHA ======\n`
  text += `MESA #${displayId}${table.description ? ' - ' + table.description.toUpperCase() : ''}\n\n`
  text += `ITENS DO PEDIDO:\n\n`

  for (const item of itemsList) {
    if (!item.products) continue

    text += `${item.quantity}X ${item.products.name.toUpperCase()}\n`

    for (const extra of item.extras) {
      text += `  + ${extra.quantity}X AD. ${extra.name.toUpperCase()}\n`
    }

    if (item.observations?.length) {
      for (const obs of item.observations) {
        text += `  * ${obs.toUpperCase()}\n`
      }
    }

    text += `----------------------\n\n`
  }

  text += `======================\n\n`

  return text.trim()
}

export function buildProductsSoldReportText(
  data: ProductsSoldReportType,
): string {
  let text = ''
  text += `\n=== PRODUTOS VENDIDOS ===\n\n`

  if (!data || data.length === 0) {
    text += 'NENHUM RESULTADO ENCONTRADO PARA O PERÍODO SELECIONADO.'
    return text
  }

  for (const item of data) {
    const name = item.name.toUpperCase()
    const quantity = item.quantity
    const total = formatCurrencyBRL(item.totalAmount)

    text += `${name}\n`
    text += `  ${quantity} UN.   ${total}\n`
    text += `----------------------\n\n`
  }

  text += `======================\n\n`

  return text.trim()
}

export function buildSalesReportText(data: SalesReportType): string {
  let text = ''
  text += `\n=== RELATÓRIO DE VENDAS ===\n\n`

  if (!data?.totalAmount) {
    text += 'NENHUM RESULTADO ENCONTRADO PARA O PERÍODO SELECIONADO.'
    return text
  }

  // Entregas
  text += `-- ENTREGAS --\n`
  text += `TOTAL DE ENTREGAS: ${data.deliveriesCount}\n\n`

  // Métodos de pagamento
  text += `-- MÉTODOS DE PAGAMENTO --\n`
  text += `TOTAL DE VENDAS: ${formatCurrencyBRL(data.totalAmount)}\n\n`

  for (const [key, value] of Object.entries(data.paymentTypes || {})) {
    const paymentLabel = PAYMENT_TYPES[key as keyof typeof PAYMENT_TYPES] || key
    text += `${paymentLabel.toUpperCase()}: ${formatCurrencyBRL(value)}\n`
  }

  text += `\n======================\n\n`

  return text.trim()
}
