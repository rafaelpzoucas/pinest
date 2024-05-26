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
import { MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { readCategories } from './actions'

export async function Categories() {
  const { data: categories, error } = await readCategories()

  if (error) {
    return <div>Não há categorias</div>
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
