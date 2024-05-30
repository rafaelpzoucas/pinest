import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { SearchSheet } from '../(app)/@search/search-sheet'
import { ProductCard } from '../(app)/components/product-card'
import { getSearchedProducts } from './actions'

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { public_store: string }
  searchParams: { q: string }
}) {
  const { products, searchError } = await getSearchedProducts(searchParams.q)

  if (searchError) {
    console.error(searchError)
  }

  return (
    <div>
      <header className="flex flex-row p-4 gap-2">
        <Link
          href={`/${params.public_store}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <SearchSheet publicStore={params.public_store} />
      </header>

      <section className="flex flex-col gap-8 pt-4 pb-16">
        <div className="flex flex-col px-4">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  variant={'featured'}
                  data={product}
                  publicStore={params.public_store}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto text-muted">
              <Search className="w-20 h-20" />
              <p className="text-center text-muted-foreground">
                Não encontramos nenhum resultado para &quot;{searchParams.q}
                &quot;
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
