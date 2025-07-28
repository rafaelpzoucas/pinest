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

  console.log({ purchase })

  text += `DATA: ${format(new Date(purchase.created_at), 'dd/MM HH:mm:ss')}\n`
  text += `Ident.: ${customerName.toUpperCase()}\n`

  text += '========================='

  text += `\n\nITENS DO PEDIDO:\n\n`

  if (!isIfood) {
    const lastItemIndex = itemsList.length - 1

    for (const [index, item] of itemsList.entries()) {
      if (!item.products) continue

      text += `${item.quantity} ${item.products.name.toUpperCase()}\n`

      const extras = item.extras
      const lastExtraIndex = extras.length - 1

      for (const [i, extra] of extras.entries()) {
        const isLastExtra = i === lastExtraIndex
        text += `  + ${extra.quantity} ad. ${extra.name.toUpperCase()}${isLastExtra ? '' : '\n'}`
      }

      if (extras.length > 0) text += '\n'

      if (item.observations?.length) {
        for (const obs of item.observations) {
          text += `  * ${obs.toUpperCase()}\n`
        }
      }

      const isLastItem = index === lastItemIndex
      if (!isLastItem) {
        text += `----------------------\n`
      }
    }
  } else {
    const ifoodItems = purchase.ifood_order_data.items
    const lastIfoodIndex = ifoodItems.length - 1

    for (const [index, item] of ifoodItems.entries()) {
      text += `${item.quantity}X ${item.name.toUpperCase()}\n`

      const options = item.options ?? []
      const lastOptionIndex = options.length - 1

      for (const [i, option] of options.entries()) {
        const isLastOption = i === lastOptionIndex
        text += `  + ${option.quantity}X AD. ${option.name.toUpperCase()}${isLastOption ? '' : '\n'}`
      }

      if (options.length > 0) text += '\n'

      if (item.observations) {
        text += `  **${item.observations.toUpperCase()}\n`
      }

      const isLastItem = index === lastIfoodIndex
      if (!isLastItem) {
        text += `----------------------\n\n`
      }
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
    const items = purchase.purchase_items

    for (const [index, item] of items.entries()) {
      if (!item.products) continue

      const itemTotal = item.product_price
      const extrasTotal = item.extras.reduce(
        (acc, extra) => acc + extra.price * extra.quantity,
        0,
      )
      const total = (itemTotal + extrasTotal) * item.quantity

      text += `${item.quantity} ${item.products.name.toUpperCase()} - ${formatCurrencyBRL(total)}\n`

      for (const extra of item.extras) {
        text += `  + ${extra.quantity} ad. ${extra.name.toUpperCase()} - ${formatCurrencyBRL(extra.price * extra.quantity)}\n`
      }

      for (const obs of item.observations ?? []) {
        text += `  * ${obs.toUpperCase()}\n`
      }

      const isLast = index === items.length - 1

      if (!isLast) {
        text += `----------------------\n`
      }
    }
  } else {
    const items = ifoodOrder.items

    for (const [index, item] of items.entries()) {
      text += `${item.quantity}X ${item.name.toUpperCase()}\n`

      for (const option of item.options ?? []) {
        text += `  + ${option.quantity}X AD. ${option.name.toUpperCase()}\n`
      }

      if (item.observations) {
        text += `  * ${item.observations.toUpperCase()}\n`
      }

      const isLast = items.length - 1 === index

      if (!isLast) {
        text += `----------------------\n`
      }
    }
  }

  text += `======================\n\n`

  // Total do pedido
  const total = formatCurrencyBRL(purchase.total.total_amount)
  function centerText(text: string, width: number) {
    const space = width - text.length
    const left = Math.floor(space / 2)
    const right = space - left
    return ' '.repeat(left) + text + ' '.repeat(right)
  }

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

    const boxWidth = 28
    const boxLine = '='.repeat(boxWidth)
    const labelLine = `|${centerText('COBRAR DO CLIENTE', boxWidth - 2)}|`
    const valueLine = `|${centerText(total, boxWidth - 2)}|`
    const paymentLine = `|${centerText(paymentLabel, boxWidth - 2)}|`

    text += `${boxLine}\n${labelLine}\n${valueLine}\n${paymentLine}\n${boxLine}\n\n`

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

  const lastItemIndex = itemsList.length - 1

  for (const [index, item] of itemsList.entries()) {
    if (!item.products) continue

    text += `${item.quantity}X ${item.products.name.toUpperCase()}\n`

    const extras = item.extras
    const lastExtraIndex = extras.length - 1

    for (const [extraIndex, extra] of extras.entries()) {
      const isLastExtra = extraIndex === lastExtraIndex
      text += `  + ${extra.quantity}X AD. ${extra.name.toUpperCase()}${isLastExtra ? '' : '\n'}`
    }

    if (item.extras.length > 0) text += '\n'

    if (item.observations?.length) {
      for (const obs of item.observations) {
        text += `  * ${obs.toUpperCase()}\n`
      }
    }

    const isLastItem = index === lastItemIndex
    if (!isLastItem) {
      text += `----------------------\n\n`
    }
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
    text += 'NENHUM RESULTADO ENCONTRADO.'
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
    text += 'NENHUM RESULTADO ENCONTRADO.'
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
