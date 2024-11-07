import { Box } from 'lucide-react'

import { readProductsByStore } from '@/app/admin/(protected)/(app)/catalog/products/actions'
import { ProductCard } from '@/app/admin/(protected)/(app)/catalog/products/product-card'
import { readUser } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'

export async function Products() {
  const { data: user } = await readUser()
  const { data: products, error } = await readProductsByStore(
    user?.stores[0].id,
  )

  if (error) {
    console.error(error)
    return <div>Não foi possível buscar seus produtos</div>
  }

  if (products && products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
          mx-auto"
      >
        <Box className="w-20 h-20" />
        <p className="text-muted-foreground">Não há produtos cadastrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="lg:hidden">
        {products &&
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>

      <div className="hidden lg:flex">
        {products && <DataTable columns={columns} data={products} />}
      </div>
    </div>
  )
}
