import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Boxes, Plus } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '../products/product-card'
import { readCategoriesByStore } from './actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { CategoryOptions } from './options'

export async function Categories() {
  const { data: categories, error } = await readCategoriesByStore()

  if (error) {
    console.error(error)
    return <div>Não foi possível buscar suas categorias</div>
  }

  if (categories && categories.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
          mx-auto"
      >
        <Boxes className="w-20 h-20" />
        <p className="text-muted-foreground">Não há categorias cadastradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {categories &&
          categories.map((category) => (
            <Card className="relative p-4" key={category.id}>
              <div className="space-y-4">
                <strong>{category.name}</strong>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}

                <div className="space-y-2">
                  {category.products.length > 0 &&
                    category.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}

                  <Link
                    href={`catalog/products/register?category_id=${category.id}`}
                    className={cn(buttonVariants(), 'max-w-md w-full')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar produto
                  </Link>
                </div>
              </div>

              <div className="absolute top-1 right-1">
                <CategoryOptions categoryId={category.id} />
              </div>
            </Card>
          ))}
      </div>

      <div className="hidden">
        {categories && <DataTable columns={columns} data={categories} />}
      </div>
    </div>
  )
}
