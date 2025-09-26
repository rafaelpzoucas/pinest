import { readOrders, readTablesCached } from './actions'
import { Orders } from './orders'

export default async function WorkspacePage() {
  const { orders, ordersError } = await readOrders()
  const [data] = await readTablesCached()

  if (ordersError) {
    console.error(ordersError)
    return null
  }

  if (!data) {
    console.error('Error fetching tables')
    return null
  }

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <Orders orders={orders} tables={data.tables} />
    </main>
  )
}
