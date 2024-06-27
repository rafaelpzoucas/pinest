import { ProductCard } from '@/components/product-card'
import { Box } from 'lucide-react'
import { readUser } from '../../account/actions'
import { readProductsByStore } from './actions'

export async function Products() {
  const { data: user } = await readUser()
  const { data: products, error } = await readProductsByStore(
    user?.stores[0].id,
  )

  if (error) {
    console.log(error)
    return <div>Não foi possível buscar seus produtos</div>
  }

  if (products && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted mx-auto">
        <Box className="w-20 h-20" />
        <p className="text-muted-foreground">Não há produtos cadastrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {products &&
        products.map((product) => (
          <ProductCard
            key={product.id}
            data={product}
            variant={'catalog'}
            className="w-full"
          />
        ))}
    </div>
  )
}
