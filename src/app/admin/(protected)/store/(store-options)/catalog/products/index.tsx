import { Card } from '@/components/ui/card'
import { readProducts } from './actions'
import { ProductOptions } from './options'

export async function Products() {
  const { data: products, error } = await readProducts()

  if (error) {
    console.log(error)
    return <div>Não foi possível buscar seus produtos</div>
  }

  if (products && products.length === 0) {
    return <div>Não há produtos cadastrados</div>
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
