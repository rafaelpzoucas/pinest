import { PAYMENT_TYPES, PurchaseType } from '@/models/purchase'
import { TableType } from '@/models/table'
import { format } from 'date-fns'

import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'

export function buildReceiptKitchenText(
  purchase: PurchaseType,
  reprint = false,
) {
  if (!purchase) return ''

  const displayId = purchase.id.substring(0, 4)
  const isIfood = purchase.is_ifood
  const customer = isIfood
    ? purchase.ifood_order_data.customer
    : purchase.store_customers.customers

  const itemsList = reprint
    ? purchase.purchase_items
    : purchase.purchase_items.filter((item) => !item.printed)

  let text = ''

  text += `${reprint ? 'REIMPRESSÃO - ' : ''}COZINHA\n`
  text += `Pedido #${displayId}\n`
  text += `${purchase.type}\n\n` // aqui você pode adaptar para DELIVERY_TYPES

  text += `Data: ${format(new Date(purchase.created_at), 'dd/MM HH:mm:ss')}\n`
  text += `Cliente: ${customer.name}\n`

  if (purchase.observations) {
    text += `OBS: ${purchase.observations.toUpperCase()}\n`
  }

  text += `\nItens do pedido:\n`

  if (!isIfood) {
    for (const item of itemsList) {
      if (!item.products) continue
      text += `${item.quantity}x ${item.products.name.toUpperCase()}\n`

      if (item.extras.length > 0) {
        for (const extra of item.extras) {
          text += `  + ${extra.quantity} ad. ${extra.name.toUpperCase()}\n`
        }
      }

      if (item.observations && item.observations.length > 0) {
        for (const obs of item.observations) {
          text += `  * ${obs}\n`
        }
      }
    }
  } else {
    for (const item of purchase.ifood_order_data.items) {
      text += `${item.quantity}x ${item.name.toUpperCase()}\n`

      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          text += `  + ${option.quantity} ad. ${option.name.toUpperCase()}\n`
        }
      }

      if (item.observations) {
        text += `  **${item.observations}\n`
      }
    }
  }

  return text
}

export function buildReceiptDeliveryText(
  purchase: PurchaseType,
  reprint = false,
) {
  if (!purchase) return ''

  const isIfood = purchase.is_ifood
  const ifoodOrder = isIfood && purchase.ifood_order_data
  const customer = isIfood
    ? purchase.ifood_order_data.customer
    : purchase.store_customers.customers

  const customerPhone = isIfood
    ? `${customer.phone.number} ID: ${customer.phone.localizer}`
    : customer.phone

  const customerAddress = isIfood
    ? (purchase.delivery.address as unknown as string)
    : formatAddress(purchase.store_customers.customers.address)

  const displayId = isIfood ? ifoodOrder.displayId : purchase.id.substring(0, 4)

  const deliveryType = {
    TAKEOUT: 'RETIRAR NA LOJA',
    DELIVERY: 'ENTREGAR',
  }[purchase.type]

  let text = ''

  text += `${reprint ? 'REIMPRESSÃO' : ''}\n`
  text += `Pedido #${displayId}\n`
  text += `${deliveryType}\n\n`

  text += `Data: ${format(new Date(purchase.created_at), 'dd/MM HH:mm:ss')}\n`
  if (isIfood) {
    text += `Entrega: ${format(new Date(ifoodOrder.delivery.deliveryDateTime), 'dd/MM HH:mm:ss')}\n`
  }

  text += `Cliente: ${customer.name.toUpperCase()}\n`
  text += `Telefone: ${customerPhone}\n`
  text += `Endereço: ${customerAddress?.toUpperCase()}\n`

  if (purchase.observations || ifoodOrder?.delivery?.observations) {
    text += `OBS: ${(ifoodOrder?.delivery?.observations ?? purchase.observations).toUpperCase()}\n`
  }

  text += `\nItens do pedido:\n`

  if (!isIfood) {
    for (const item of purchase.purchase_items) {
      if (!item.products) continue

      const itemTotal = item.product_price
      const extrasTotal = item.extras.reduce(
        (acc, extra) => acc + extra.price * extra.quantity,
        0,
      )
      const total = (itemTotal + extrasTotal) * item.quantity

      text += `${item.quantity}x ${item.products.name.toUpperCase()} - ${formatCurrencyBRL(total)}\n`

      for (const extra of item.extras) {
        text += `  + ${extra.quantity} ad. ${extra.name.toUpperCase()} - ${formatCurrencyBRL(extra.price * extra.quantity)}\n`
      }

      for (const obs of item.observations ?? []) {
        text += `  * ${obs}\n`
      }
    }
  } else {
    for (const item of ifoodOrder.items) {
      text += `${item.quantity}x ${item.name.toUpperCase()}\n`

      for (const option of item.options ?? []) {
        text += `  + ${option.quantity} ad. ${option.name.toUpperCase()}\n`
      }

      if (item.observations) {
        text += `  * ${item.observations}\n`
      }
    }
  }

  // Total do pedido
  const total = formatCurrencyBRL(purchase.total.total_amount)

  text += `\nTOTAL: ${total}\n`

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

    text += `\nPAGAMENTO:\n${paymentLabel}\n`

    if (purchase.total.change_value > 0) {
      const troco = purchase.total.change_value - purchase.total.total_amount
      text += `TROCO PARA: ${formatCurrencyBRL(troco)}\n`
    }

    if (isIfood && ifoodOrder?.extraInfo) {
      text += `INFO ADICIONAL: ${ifoodOrder.extraInfo}\n`
    }
  }

  return text
}

export function buildReceiptTableText(
  table: TableType,
  reprint = false,
): string {
  console.log({ table })
  const displayId = table.number
  const itemsList = reprint
    ? table.purchase_items
    : table.purchase_items.filter((item) => !item.printed)

  let text = ''
  text += `\n====== COZINHA ======\n`
  text += `MESA #${displayId}${table.description ? ' - ' + table.description.toUpperCase() : ''}\n\n`

  for (const item of itemsList) {
    if (!item.products) continue

    text += `${item.quantity}x ${item.products.name.toUpperCase()}\n`

    for (const extra of item.extras) {
      text += `  + ${extra.quantity}x AD. ${extra.name.toUpperCase()}\n`
    }

    if (item.observations?.length) {
      for (const obs of item.observations) {
        text += `  * ${obs.toUpperCase()}\n`
      }
    }

    text += `----------------------\n`
  }

  return text.trim()
}
