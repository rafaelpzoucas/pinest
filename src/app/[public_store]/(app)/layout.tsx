import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loja | Pinest',
  description: 'Loja virtual criada com a Pinest',
}

export default function StoreLayout({
  header,
  categories,
  promotions,
  topSellers,
  productsList,
}: {
  header: React.ReactNode
  categories: React.ReactNode
  promotions: React.ReactNode
  topSellers: React.ReactNode
  productsList: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {header}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex w-full lg:max-w-xs">{categories}</aside>

        <div className="w-full max-w-[1014px]">
          {promotions}

          {topSellers}

          {productsList}
        </div>
      </div>
    </div>
  )
}
