import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { OrderType } from '@/models/order'
import { getMonthlyOrdersComparison } from './actions'

export async function TotalSales() {
  const {
    currentMonthOrders,
    previousMonthOrders,
    error: ordersError,
  } = await getMonthlyOrdersComparison()

  if (ordersError) {
    console.error(ordersError)
  }

  const calculateTotalAmount = (orders: OrderType[]): number => {
    if (orders && orders.length > 0) {
      return orders.reduce((total, order) => {
        const orderTotal = order.order_items.reduce((sum, item) => {
          return sum + item.quantity * item.product_price
        }, 0)
        return total + orderTotal
      }, 0)
    } else {
      return 0
    }
  }

  function calculatePercentageDifference(
    current: number,
    previous: number,
  ): number {
    // Evita divisão por zero
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }

    // Calcula a diferença percentual
    const difference = ((current - previous) / previous) * 100

    // Arredonda para 2 casas decimais
    return Number(difference.toFixed(2))
  }

  if (!currentMonthOrders || !previousMonthOrders) {
    return null // Show a loading state or an error message here. Return null for now.
  }

  const currentAmount = calculateTotalAmount(currentMonthOrders)
  const previousAmount = calculateTotalAmount(previousMonthOrders)

  const percentageChange = calculatePercentageDifference(
    currentAmount,
    previousAmount,
  )

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Vendas Totais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <strong className="text-2xl">
            {formatCurrencyBRL(currentAmount)}
          </strong>
          <span
            className={cn(
              'text-sm text-muted-foreground',
              percentageChange > 0
                ? 'text-emerald-900 dark:text-emerald-700'
                : 'text-destructive',
            )}
          >
            {percentageChange > 0 && '+'}
            {percentageChange}% em relação ao mês anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
