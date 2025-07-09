import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { readPendingBalancesCached } from './actions'

export async function PendingBalances() {
  const [storeCustomersData] = await readPendingBalancesCached()

  const storeCustomers = storeCustomersData?.storeCustomers

  if (!storeCustomers || storeCustomers.length === 0) {
    return
  }

  return (
    <Card className="h-auto max-w-full break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-xl">Saldos pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {storeCustomers.map((customer) => (
            <p
              key={customer.id}
              className="flex flex-row items-center justify-between py-2 border-b last:border-0"
            >
              <span>{customer.customers.name}</span>
              <span>{formatCurrencyBRL(customer.balance)}</span>
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
