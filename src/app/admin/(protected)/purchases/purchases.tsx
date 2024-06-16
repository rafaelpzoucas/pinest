'use client'

import { Input } from '@/components/ui/input'
import { PurchaseType } from '@/models/purchase'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { PurchaseCard } from './purchase-card'

export function Purchases({ purchases }: { purchases: PurchaseType[] }) {
  const [search, setSearch] = useState('')

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || ''

  const searchStr = normalizeString(search)

  const filteredPurchases =
    purchases &&
    purchases.filter((purchase) => {
      const { customers } = purchase

      return normalizeString(customers.users.name).includes(searchStr)
    })

  return (
    <section className="flex flex-col gap-2 text-sm">
      <div className="relative">
        <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar pedido..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {purchases &&
        filteredPurchases.map((purchase) => (
          <PurchaseCard key={purchase.id} purchase={purchase} />
        ))}
    </section>
  )
}
