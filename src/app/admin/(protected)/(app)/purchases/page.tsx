import { AdminHeader } from '@/app/admin-header'
import { readPurchases } from './actions'
import { Purchases } from './purchases'

export default async function WorkspacePage() {
  const { purchases, purchasesError } = await readPurchases()

  if (purchasesError) console.error(purchasesError)

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <AdminHeader title="Pedidos" />

      <Purchases purchases={purchases} />
    </main>
  )
}
