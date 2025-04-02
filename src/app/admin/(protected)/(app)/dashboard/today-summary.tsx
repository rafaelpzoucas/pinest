import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { getTotalPurchasesOfToday } from './actions'

export async function TodaySummary() {
  const { purchases, purchasesError, purchasesCount } =
    await getTotalPurchasesOfToday()

  if (purchasesError) {
    console.error(purchasesError)
  }

  const calculateTotalAmount = (): number => {
    if (purchases && purchases.length > 0) {
      return purchases.reduce((total, purchase) => {
        const purchaseTotal = purchase.purchase_items.reduce((sum, item) => {
          return sum + item.quantity * item.product_price
        }, 0)
        return total + purchaseTotal
      }, 0)
    } else {
      return 0
    }
  }

  const totalAmount = calculateTotalAmount()
  const AOV = purchasesCount ? totalAmount / purchasesCount : 0

  return (
    <Card className="h-auto max-w-full break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-xl">Resumo de hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between w-full">
          <span className="text-muted-foreground">Total de pedidos</span>
          <strong>{purchasesCount ?? 0}</strong>
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
