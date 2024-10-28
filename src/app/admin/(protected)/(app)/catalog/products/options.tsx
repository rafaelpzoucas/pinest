'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { ProductType } from '@/models/product'
import { Edit, MoreVertical, Trash } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { deleteProduct } from './actions'

type ProductOptions = Omit<ProductType, 'product_images'>

export function ProductOptions({ productId }: { productId: string }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)

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
          <Link href={`catalog/products/register?id=${productId}`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>

          <DropdownMenuItem onClick={() => setIsAlertOpen(true)}>
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden lg:flex flex-row">
        <Link
          href={`catalog/products/register?id=${productId}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <Edit className="w-4 h-4" />
        </Link>
        <Button
          onClick={() => setIsAlertOpen(true)}
          variant="ghost"
          size="icon"
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja excluir o produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => deleteProduct(productId)}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
