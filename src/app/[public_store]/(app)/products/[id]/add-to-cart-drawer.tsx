import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Plus } from 'lucide-react'

import { AmountControl } from '@/components/amount-control'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/format-number'
import { ProductCard, ProductDataType } from '@/app/[public_store]/product-card'

type AddToCardDrawerProps = {
  product: ProductDataType
}

export function AddToCardDrawer({ product }: AddToCardDrawerProps) {
  const totalPrice = product.price * 1

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ao carrinho
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col gap-6 px-4 pt-5">
          <section className="flex flex-row gap-2 items-center justify-between">
            <ProductCard variant={'bag_items'} data={product} />
          </section>

          <Input placeholder="Escreva suas observações..." />
        </div>

        <DrawerFooter className="flex flex-row gap-4">
          <AmountControl />
          <Button className="flex flex-row items-center justify-between w-full">
            Adicionar <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
