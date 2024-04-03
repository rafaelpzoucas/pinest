'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ProductDataType } from '../../product-card'

type CartProductPropsType = {
  product: ProductDataType
}

export function CartProduct({ product }: CartProductPropsType) {
  const [isQttOpen, setIsQttOpen] = useState(false)

  return (
    <div
      key={product.title}
      className="flex flex-col gap-2 py-2 border-b last:border-0"
    >
      <div className="flex flex-row gap-4">
        <p className="line-clamp-2 max-w-56 text-sm text-muted-foreground">
          {product.title}
        </p>
      </div>

      <footer className="flex flex-row items-center justify-between">
        <Select
          defaultValue="1"
          onValueChange={(value) => value === 'more' && setIsQttOpen(true)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 un.</SelectItem>
            <SelectItem value="2">2 un.</SelectItem>
            <SelectItem value="3">3 un.</SelectItem>
            <SelectItem value="4">4 un.</SelectItem>
            <SelectItem value="5">5 un.</SelectItem>
            <SelectItem value="6">6 un.</SelectItem>
            <SelectItem value="more">Mais de 6 un.</SelectItem>
          </SelectContent>
        </Select>

        <Drawer open={isQttOpen} onOpenChange={setIsQttOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Informe uma quantidade</DrawerTitle>
              <DrawerDescription>100 disponíveis</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-1">
              <Input type="number" placeholder="Digite a quantidade" />
            </div>
            <DrawerFooter>
              <Button>Confirmar</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <div className="leading-4 flex flex-col ml-auto items-end">
          <p
            className={cn(
              'font-bold text-primary text-sm',
              product.promotional_price > 0 &&
                'font-light text-xs text-muted-foreground line-through',
            )}
          >
            {Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(product.price)}
          </p>
          <p
            className={cn(
              'hidden font-bold text-primary text-sm',
              product.promotional_price > 0 && 'block',
            )}
          >
            {Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(product.promotional_price)}
          </p>
        </div>
      </footer>
    </div>
  )
}
