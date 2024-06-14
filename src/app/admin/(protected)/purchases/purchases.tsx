import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { readPurchases } from './actions'
import { PurchaseCard } from './purchase-card'

export async function Purchases() {
  const { purchases, purchasesError } = await readPurchases()

  if (purchasesError || (purchases && purchases.length === 0)) {
    return null
  }

  return (
    <section className="flex flex-col gap-2 text-sm">
      <div className="relative">
        <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar pedido..." className="pl-10" />
      </div>

      {purchases &&
        purchases.map((purchase) => (
          <PurchaseCard key={purchase.id} purchase={purchase} />
        ))}
    </section>
  )
}
