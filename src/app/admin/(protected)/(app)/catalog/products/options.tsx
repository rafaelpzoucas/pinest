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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { ProductType } from '@/models/product'
import { Edit, Layers2, MoreVertical, Trash } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { deleteProduct, duplicateProduct } from './actions'
import { ProductStatus } from './product-status'

type ProductOptions = Omit<ProductType, 'product_images'>

export function ProductOptions({ product }: { product: ProductType }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  return (
    <>
      <div className="lg:hidden flex flex-row items-center gap-2">
        <ProductStatus productId={product.id} defaultStatus={product.status} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'ghost'} size={'icon'}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Opções</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`catalog/products/register?id=${product.id}`}>
              <DropdownMenuItem>Editar</DropdownMenuItem>
            </Link>

            <DropdownMenuItem onClick={() => duplicateProduct(product.id)}>
              Duplicar
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setIsAlertOpen(true)}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden lg:flex flex-row items-center pr-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`catalog/products/register?id=${product.id}`}
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <Edit className="w-4 h-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => duplicateProduct(product.id)}
                variant="ghost"
                size="icon"
              >
                <Layers2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Duplicar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsAlertOpen(true)}
                variant="ghost"
                size="icon"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ProductStatus
                  productId={product.id}
                  defaultStatus={product.status}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{product.status ? 'Pausar venda' : 'Ativar produto'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              onClick={() => deleteProduct(product.id)}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
