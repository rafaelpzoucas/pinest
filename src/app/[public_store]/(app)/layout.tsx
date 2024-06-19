import { Island } from '@/components/island'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ching Ling | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default function StoreLayout({
  header,
  search,
  promotions,
  topSellers,
  productsList,
  bagIsland,
}: {
  header: React.ReactNode
  search: React.ReactNode
  promotions: React.ReactNode
  topSellers: React.ReactNode
  productsList: React.ReactNode
  bagIsland: React.ReactNode
}) {
  return (
    <main className="pb-20">
      {header}

      {search}

      {promotions}

      {topSellers}

      {productsList}

      <Island>{bagIsland}</Island>
    </main>
  )
}
