import { ProductCard } from '@/components/product-card'
import { Box, Boxes } from 'lucide-react'
import { getProductsByCategory } from './actions'

export default async function ProductsList({
  params,
}: {
  params: { public_store: string }
}) {
  const { categories, categoriesError } = await getProductsByCategory(
    params.public_store,
  )

  if (categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted mx-auto">
        <Boxes className="w-20 h-20" />
        <p className="text-muted-foreground">Não encontramos nenhum produto</p>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      {categories && categories.length > 0 ? (
        categories.map((category) => (
          <div
            id={category.name.toLowerCase()}
            className="flex flex-col"
            key={category.id}
          >
            <div className="py-4 bg-background">
              <h1 className="text-xl uppercase font-bold">{category.name}</h1>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  variant={'featured'}
                  data={product}
                  publicStore={params.public_store}
                  className="hover:scale-105 focus:scale-105 delay-300 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto text-muted">
          <Box className="w-20 h-20" />
          <p className="text-center text-muted-foreground">
            Não encontramos nenhum produto
          </p>
        </div>
      )}
    </section>
  )
}
