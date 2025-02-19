import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { getMonthlyPurchasesComparison } from './actions'

export async function TotalSales() {
  const {
    currentMonthPurchases,
    previousMonthPurchases,
    error: purchasesError,
  } = await getMonthlyPurchasesComparison()

  if (purchasesError) {
    console.error(purchasesError)
  }

  const calculateTotalAmount = (purchases: PurchaseType[]): number => {
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

  if (!currentMonthPurchases || !previousMonthPurchases) {
    return null // Show a loading state or an error message here. Return null for now.
  }

  const currentAmount = calculateTotalAmount(currentMonthPurchases)
  const previousAmount = calculateTotalAmount(previousMonthPurchases)

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
