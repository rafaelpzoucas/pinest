import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { readPendingBalances } from './actions'

export async function PendingBalances() {
  const [data] = await readPendingBalances()

  if (!data?.pendingBalances || data.pendingBalances.length === 0) {
    return
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Saldos pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {data?.pendingBalances.map((customer) => (
            <p
              key={customer.id}
              className="flex flex-row items-center justify-between py-2 border-b last:border-0"
            >
              <span>{customer.name}</span>
              <span>{formatCurrencyBRL(customer.balance)}</span>
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
