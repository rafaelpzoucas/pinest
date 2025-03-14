import { adminProcedure } from '@/lib/zsa-procedures'
import { getSalesReportInputSchema } from './schemas'

export const getSalesReport = adminProcedure
  .createServerAction()
  .input(getSalesReportInputSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(
        `
          id, total_amount, payment_type, type, created_at,
          purchase_items (
            quantity,
            products ( id, name, price )
          )
        `,
      )
      .eq('store_id', store?.id)
      .gte('created_at', input.start_date)
      .lte('created_at', input.end_date)

    if (purchasesError || !purchases) {
      throw new Error('Error fetching purchases report')
    }

    const groupedPaymentTypes = purchases.reduce<Record<string, number>>(
      (acc, sale) => {
        acc[sale.payment_type] =
          (acc[sale.payment_type] || 0) + sale.total_amount
        return acc
      },
      {},
    )

    const totalAmount = Object.values(groupedPaymentTypes).reduce(
      (acc, amount) => acc + amount,
      0,
    )

    const deliveriesCount = purchases.filter(
      (purchase) => purchase.type === 'delivery',
    ).length

    const productsSold = purchases.reduce<
      { name: string; quantity: number; totalAmount: number }[]
    >((acc, purchase) => {
      purchase.purchase_items?.forEach((item) => {
        const product = item.products as unknown as {
          id: string
          name: string
          price: number
        }
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
  })
