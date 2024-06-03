import { Card } from '@/components/ui/card'
import { Box } from 'lucide-react'
import { readProducts } from './actions'
import { ProductOptions } from './options'

export async function Products() {
  const { data: products, error } = await readProducts()

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
    <div className="space-y-2">
      {products &&
        products.map((product) => (
          <Card className="relative p-4" key={product.id}>
            <strong>{product.name}</strong>
            {product.description && (
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            )}

            <ProductOptions product={product} />
          </Card>
        ))}
    </div>
  )
}
