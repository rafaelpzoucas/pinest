import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { getTotalOrdersOfToday } from './actions'

export async function TodaySummary() {
  const { orders, ordersError, ordersCount } = await getTotalOrdersOfToday()

  if (ordersError) {
    console.error(ordersError)
  }

  const calculateTotalAmount = (): number => {
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

  const totalAmount = calculateTotalAmount()
  const AOV = ordersCount ? totalAmount / ordersCount : 0

  return (
    <Card className="h-auto max-w-full break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-xl">Resumo de hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between w-full">
          <span className="text-muted-foreground">Total de pedidos</span>
          <strong>{ordersCount ?? 0}</strong>
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <span className="text-muted-foreground">Faturamento total</span>
          <strong>{formatCurrencyBRL(totalAmount)}</strong>
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <span className="text-muted-foreground">Ticket Médio</span>
          <strong>{formatCurrencyBRL(AOV)}</strong>
        </div>
      </CardContent>
    </Card>
  )
}
