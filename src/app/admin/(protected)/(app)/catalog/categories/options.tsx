import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, MoreVertical } from 'lucide-react'
import Link from 'next/link'

export function CategoryOptions({ categoryId }: { categoryId: string }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="lg:hidden">
          <Button variant={'ghost'} size={'icon'}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opções</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`catalog/categories/register?id=${categoryId}`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden lg:block">
        <Link
          href={`catalog/categories/register?id=${categoryId}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <Edit className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}
