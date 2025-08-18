import { OrderType, PAYMENT_TYPES } from '@/models/order'
import { TableType } from '@/models/table'
import { format } from 'date-fns'

import { ProductsSoldReportType } from '@/app/admin/(protected)/(app)/reports/products-sold'
import { SalesReportType } from '@/app/admin/(protected)/(app)/reports/sales-report'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { receipt } from './escpos'

export function buildReceiptKitchenESCPOS(order?: OrderType, reprint = false) {
  if (!order) return ''

  const displayId = order?.display_id ?? order.id.substring(0, 4)
  const isIfood = order?.is_ifood

  const customer = isIfood
    ? order.ifood_order_data.customer
    : order.store_customers.customers

  const customerName = `${customer.name.split(' ')[0]} ${customer.name.split(' ')[1]}`
  const itemsList = reprint
    ? order.order_items
    : order.order_items.filter((item) => !item.printed)

  const r = receipt()
    .left()
    .strong()
    .h3(`${reprint ? 'REIMPRESSÃO - ' : ''}COZINHA`)
    .endStrong()
    .br()
    .h2(`Ident: ${customerName.toUpperCase()}`)
    .hr()
    .strong()
    .h2(`PEDIDO #${displayId}`)
    .endStrong()
    .br()
    .p(`DATA: ${format(new Date(order.created_at), 'dd/MM HH:mm:ss')}`)
    .hr()

  if (!isIfood) {
    const lastItemIndex = itemsList.length - 1

    for (const [index, item] of itemsList.entries()) {
      if (!item.products) continue

      // Nome do produto
      r.strong()
        .h2(`${item.quantity} ${item.products.name.toUpperCase()}`)
        .endStrong()
        .br()

      // Extras
      for (const [i, extra] of item.extras.entries()) {
        r.h2(` +${extra.quantity} ad. ${extra.name.toUpperCase()}`).br()
      }

      if (item.extras.length > 0) r.br()

      if (item.observations.length > 0 && item.observations[0] !== '') {
        for (const obs of item.observations) {
          r.h2(` *${obs.toUpperCase()}`).br()
        }
      }

      if (index !== lastItemIndex) {
        r.hr()
      }
    }
  } else {
    const ifoodItems = order.ifood_order_data.items
    const lastIfoodIndex = ifoodItems.length - 1

    for (const [index, item] of ifoodItems.entries()) {
      r.h2(`${item.quantity} ${item.name.toUpperCase()}`).br()

      for (const option of item.options ?? []) {
        r.h2(` +${option.quantity} ad. ${option.name.toUpperCase()}`).br()
      }

      if (item.options?.length) r.br()

      if (item.observations) {
        r.h2(` *${item.observations.toUpperCase()}`).br()
      }

      if (index !== lastIfoodIndex) {
        r.hr()
      }
    }
  }

  const escposString = r.cut().build()
  return Buffer.from(escposString, 'binary').toString('base64')
}

export function buildReceiptDeliveryESCPOS(order?: OrderType, reprint = false) {
  if (!order) return ''

  const isIfood = order?.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && order.ifood_order_data

  const customer = isIfood
    ? order?.ifood_order_data.customer
    : order?.store_customers.customers

  const customerName = customer.name
  const customerPhone = isIfood
    ? `${customer.phone.number} ID: ${customer.phone.localizer}`
    : customer.phone
  const customerAddress = isIfood
    ? (order.delivery.address as unknown as string)
    : formatAddress(order?.store_customers.customers.address)

  const displayId = isIfood
    ? ifoodOrder.displayId
    : (order?.display_id ?? order?.id.substring(0, 4))

  const deliveryType = {
    TAKEOUT: 'RETIRAR NA LOJA',
    DELIVERY: 'ENTREGAR',
  }[order.type]

  // Inicia o builder ESC/POS
  const r = receipt().initialize()

  // Adiciona cabeçalho
  if (reprint) {
    r.center().h3('REIMPRESSÃO').br()
  }

  r.center()
    .h2(`PEDIDO #${displayId}`)
    .br()
    .center()
    .h2(deliveryType)
    .hr()
    .left()

  // Adiciona informações básicas
  r.p(`DATA: ${format(new Date(order.created_at), 'dd/MM HH:mm:ss')}`).br()

  if (isIfood) {
    r.p(
      `ENTREGA: ${format(new Date(ifoodOrder.delivery.deliveryDateTime), 'dd/MM HH:mm:ss')}`,
    ).br()
  }

  r.p(`CLIENTE: ${customerName.toUpperCase()}`)
    .br()
    .p(`TELEFONE: ${String(customerPhone).toUpperCase()}`)
    .br()
    .p(`ENDEREÇO: ${String(customerAddress).toUpperCase()}`)
    .br()

  if (order.observations || ifoodOrder?.delivery?.observations) {
    r.strong()
      .p(
        `OBS: ${(ifoodOrder?.delivery?.observations ?? order.observations).toUpperCase().trim()}`,
      )
      .endStrong()
  }

  r.hr().h3('ITENS DO PEDIDO:').br(2)

  // Adiciona itens do pedido
  if (!isIfood) {
    const items = order.order_items

    for (const [index, item] of items.entries()) {
      if (!item.products) {
        r.p(
          `${item.quantity} ${item.description} - ${formatCurrencyBRL(item.product_price)}`,
        )
        continue
      }

      const itemTotal = item.product_price
      const extrasTotal = item.extras.reduce(
        (acc, extra) => acc + extra.price * extra.quantity,
        0,
      )
      const total = (itemTotal + extrasTotal) * item.quantity

      r.p(
        `${item.quantity} ${item.products.name.toUpperCase()} - ${formatCurrencyBRL(total)}`,
      )

      for (const extra of item.extras) {
        r.br().p(
          `  +${extra.quantity} ad. ${extra.name.toUpperCase()} - ${formatCurrencyBRL(extra.price * extra.quantity)}`,
        )
      }

      if (item.observations.length > 0 && item.observations[0] !== '') {
        for (const obs of item.observations ?? []) {
          r.br().p(` *${obs.toUpperCase()}`)
        }
      }

      const isLast = index === items.length - 1

      if (!isLast) {
        r.br().hr(undefined, 'dashed')
      }
    }
  } else {
    const items = ifoodOrder.items

    for (const [index, item] of items.entries()) {
      r.p(`${item.quantity} ${item.name.toUpperCase()}`)

      for (const option of item.options ?? []) {
        r.br().p(` +${option.quantity} ad. ${option.name.toUpperCase()}`)
      }

      if (item.observations) {
        r.br().p(` *${item.observations.toUpperCase()}`)
      }

      const isLast = items.length - 1 === index

      if (!isLast) {
        r.br().hr(undefined, 'dashed')
      }
    }
  }

  // Total do pedido
  const total = formatCurrencyBRL(order.total.total_amount)

  // Forma de pagamento
  if (order.payment_type) {
    const isIfood = order.is_ifood
    const ifoodOrder: IfoodOrder | undefined = isIfood && order.ifood_order_data

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
          order.payment_type as keyof typeof PAYMENT_TYPES
        ]?.toUpperCase() || 'INDEFINIDO'
    }

    r.hr(undefined, 'double')
      .center()
      .h3('TOTAL')
      .br()
      .center()
      .strong()
      .h2(total)
      .endStrong()
      .hr(undefined, 'double')
      .center()
      .h3(paymentLabel)

    if (order.total.change_value > 0) {
      const changeValue = order.total.change_value - order.total.total_amount

      r.br()
        .strong()
        .h3(`TROCO PARA: ${formatCurrencyBRL(changeValue)}`)
        .endStrong()
        .br()
    }

    if (isIfood && ifoodOrder?.extraInfo) {
      r.text(`INFO ADICIONAL: ${ifoodOrder.extraInfo.toUpperCase()}`).br(2)
    }
  }

  const escposString = r.cut().build()
  return Buffer.from(escposString, 'binary').toString('base64')
}

export function buildReceiptTableESCPOS(
  table: TableType,
  reprint = false,
): string {
  const displayId = table.number
  const itemsList = reprint
    ? table.order_items
    : table.order_items.filter((item) => !item.printed)

  const r = receipt()
    .left()
    .strong()
    .h3(`${reprint ? 'REIMPRESSÃO - ' : ''}COZINHA`)
    .endStrong()
    .br()
    .h2(`Ident: ${table.description.toUpperCase()}`)
    .hr()
    .strong()
    .h2(`MESA #${displayId}`)
    .endStrong()
    .br()
    .p(`Data: ${format(table.created_at, 'dd/MM HH:mm:ss')}`)
    .hr()

  const lastItemIndex = itemsList.length - 1

  for (const [index, item] of itemsList.entries()) {
    if (!item.products) continue

    // Nome do produto
    r.strong()
      .h2(`${item.quantity} ${item.products.name.toUpperCase()}`)
      .endStrong()
      .br()

    // Extras
    for (const [i, extra] of item.extras.entries()) {
      r.h2(`+ ${extra.quantity} ad. ${extra.name.toUpperCase()}`).br()
    }

    // Observações
    if (item.observations?.length) {
      for (const obs of item.observations) {
        r.h2(`* ${obs.toUpperCase()}`).br()
      }
    }

    if (index !== lastItemIndex) {
      r.hr()
    }
  }

  const escposString = r.cut().feed(3).build()
  return Buffer.from(escposString, 'binary').toString('base64')
}

export function buildProductsSoldReportESCPOS(
  data: ProductsSoldReportType,
): string {
  const r = receipt().center().strong().h3('PRODUTOS VENDIDOS').endStrong().br()

  if (!data || data.length === 0) {
    r.h2('NENHUM RESULTADO ENCONTRADO.')
    return r.build().trim()
  }

  for (const item of data) {
    const name = item.name.toUpperCase()
    const quantity = item.quantity
    const total = formatCurrencyBRL(item.totalAmount)

    r.strong().p(`${name}   -   ${quantity} un.   ${total}`).endStrong().hr()
  }

  const escposString = r.cut().feed(3).build()
  return Buffer.from(escposString, 'binary').toString('base64')
}

export function buildSalesReportESCPOS(data: SalesReportType): string {
  const r = receipt().left().strong().h3('RELATÓRIO DE VENDAS').endStrong().br()

  if (!data?.totalAmount) {
    r.h2('NENHUM RESULTADO ENCONTRADO.')
    return r.build().trim()
  }

  // Seção de Entregas
  r.strong()
    .h3('ENTREGAS')
    .endStrong()
    .br()
    .h3(`TOTAL DE ENTREGAS: ${data.deliveriesCount}`)
    .br()
    .hr(undefined, 'double')
    .br()

  // Seção de Métodos de Pagamento
  r.strong()
    .h3('MÉTODOS DE PAGAMENTO')
    .endStrong()
    .br()
    .h3(`TOTAL DE VENDAS: ${formatCurrencyBRL(data.totalAmount)}`)
    .br()
    .hr(undefined, 'double')
    .br()

  // Lista de métodos de pagamento
  for (const [key, value] of Object.entries(data.paymentTypes || {})) {
    const paymentLabel = PAYMENT_TYPES[key as keyof typeof PAYMENT_TYPES] || key
    r.h2(`${paymentLabel.toUpperCase()}: ${formatCurrencyBRL(value)}`).hr()
  }

  const escposString = r.cut().feed(3).build()
  return Buffer.from(escposString, 'binary').toString('base64')
}
