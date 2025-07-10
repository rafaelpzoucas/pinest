import { adminProcedure, cashProcedure } from '@/lib/zsa-procedures'
import { endOfDay, startOfDay } from 'date-fns'
import { cache } from 'react'
import { getSalesReportInputSchema } from './schemas'

interface PurchaseItem {
  quantity: number
  products: {
    id: string
    name: string
    price: number
  }
}

// Função utilitária para processar purchases e gerar o relatório
function processSalesReport(purchases: any[]) {
  const groupedPaymentTypes = purchases.reduce<Record<string, number>>(
    (acc, sale) => {
      acc[sale.payment_type] =
        (acc[sale.payment_type] || 0) + sale.total.total_amount
      return acc
    },
    {},
  )

  const totalAmount = Object.values(groupedPaymentTypes).reduce(
    (acc, amount) => acc + amount,
    0,
  )

  const deliveriesCount = purchases.filter(
    (purchase) => purchase.type === 'DELIVERY',
  ).length

  const productsSold = purchases.reduce<
    { name: string; quantity: number; totalAmount: number }[]
  >((acc, purchase) => {
    purchase.purchase_items?.forEach((item: PurchaseItem) => {
      const product = item.products
      if (!product) return

      const existingProduct = acc.find((p) => p.name === product.name)

      if (existingProduct) {
        existingProduct.quantity += item.quantity
        existingProduct.totalAmount += item.quantity * product.price
      } else {
        acc.push({
          name: product.name,
          quantity: item.quantity,
          totalAmount: item.quantity * product.price,
        })
      }
    })

    return acc
  }, [])

  return {
    salesReport: {
      totalAmount,
      paymentTypes: groupedPaymentTypes,
      deliveriesCount,
    },
    productsSold,
  }
}

// Relatório por intervalo de datas
export const getSalesReportByDate = adminProcedure
  .createServerAction()
  .input(getSalesReportInputSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const startDate = startOfDay(input.start_date).toISOString()
    const endDate = endOfDay(input.end_date ?? input.start_date).toISOString()

    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(
        `
          id, payment_type, type, created_at, total,
          purchase_items (
            quantity,
            products ( id, name, price )
          )
        `,
      )
      .eq('store_id', store?.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (purchasesError) {
      console.error('Error fetching purchases report', purchasesError)
      return
    }

    return processSalesReport(purchases)
  })

// Relatório por cash_session_id
export const getSalesReportByCashSessionId = cashProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cashSession } = ctx

    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(
        `
          id, payment_type, type, created_at, total, cash_session_id,
          purchase_items (
            quantity,
            products ( id, name, price )
          )
        `,
      )
      .eq('store_id', store?.id)
      .eq('cash_session_id', cashSession.id)

    if (purchasesError) {
      console.error(
        'Error fetching purchases report by cash_session_id',
        purchasesError,
      )
      return
    }

    return processSalesReport(purchases)
  })

export const getSalesReportByDateCached = cache(getSalesReportByDate)
export const getSalesReportByCashSessionIdCached = cache(
  getSalesReportByCashSessionId,
)
