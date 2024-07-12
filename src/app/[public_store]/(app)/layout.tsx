import { Island } from '@/components/island'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
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
    <main className="flex items-center justify-center pb-20">
      <div className="w-full lg:max-w-6xl">
        {header}

        {search}

        {promotions}

        {topSellers}

        {productsList}
      </div>

      <Island>{bagIsland}</Island>
    </main>
  )
}
