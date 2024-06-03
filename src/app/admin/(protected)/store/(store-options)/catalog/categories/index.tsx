import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { queryParamsLink } from '@/lib/utils'
import { Boxes, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { readCategories } from './actions'

export async function Categories() {
  const { data: categories, error } = await readCategories()

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
    <div className="space-y-2">
      {categories &&
        categories.map((category) => (
          <Card className="relative p-4" key={category.id}>
            <strong>{category.name}</strong>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  className="absolute top-1 right-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link
                  href={`catalog/categories/register?${queryParamsLink(category)}`}
                >
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
    </div>
  )
}
