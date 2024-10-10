import { Card } from '@/components/ui/card'
import { Boxes } from 'lucide-react'
import { readCategoriesByStore } from './actions'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { CategoryOptions } from './options'

export async function Categories() {
  const { data: categories, error } = await readCategoriesByStore()

  if (error) {
    console.log(error)
    return <div>Não foi possível buscar suas categorias</div>
  }

  if (categories && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted mx-auto">
        <Boxes className="w-20 h-20" />
        <p className="text-muted-foreground">Não há categorias cadastradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="lg:hidden">
        {categories &&
          categories.map((category) => (
            <Card className="relative p-4" key={category.id}>
              <strong>{category.name}</strong>
              {category.description && (
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              )}

              <div className="absolute top-1 right-1">
                <CategoryOptions categoryId={category.id} />
              </div>
            </Card>
          ))}
      </div>

      <div className="hidden lg:flex">
        {categories && <DataTable columns={columns} data={categories} />}
      </div>
    </div>
  )
}
