import { readPurchases } from './actions'
import { Purchases } from './purchases'

export default async function WorkspacePage() {
  const { purchases, purchasesError } = await readPurchases()

  if (purchasesError) console.error(purchasesError)

  return (
    <main className="space-y-6 p-4">
      <h1 className="text-lg text-center font-bold">Pedidos</h1>

      {purchases ? (
        <Purchases purchases={purchases} />
      ) : (
        <div>Não há pedidos</div>
      )}
    </main>
  )
}
