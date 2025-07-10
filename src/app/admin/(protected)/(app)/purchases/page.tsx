import { readPurchases, readTablesCached } from './actions'
import { Purchases } from './purchases'

export default async function WorkspacePage() {
  const { purchases, purchasesError } = await readPurchases()
  const [data] = await readTablesCached()

  if (purchasesError) {
    console.error(purchasesError)
    return null
  }

  if (!data) {
    console.error('Error fetching tables')
    return null
  }

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <Purchases purchases={purchases} tables={data.tables} />
    </main>
  )
}
