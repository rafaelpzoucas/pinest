import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default function StoreLayout({
  header,
  categories,
  benefits,
  promotions,
  topSellers,
  productsList,
}: {
  header: React.ReactNode
  categories: React.ReactNode
  benefits: React.ReactNode
  promotions: React.ReactNode
  topSellers: React.ReactNode
  productsList: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {header}

      {categories}

      {promotions}

      {topSellers}

      {benefits}

      {productsList}
    </div>
  )
}
