import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { createTableSchema } from '../schemas'

type OrderItemType = z.infer<typeof createTableSchema>['order_items'][number]

export function Extras({
  form,
  extras,
  product,
  selectedProducts,
}: {
  form: UseFormReturn<z.infer<typeof createTableSchema>>
  extras: ExtraType[]
  product: ProductType
  selectedProducts: OrderItemType[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProductExtras, setSelectedProductExtras] = useState<
    Record<string, Record<string, number>>
  >({})

  // Função para calcular o preço total com os extras
  const calculateTotalPrice = (productId: string) => {
    const productIndex = selectedProducts.findIndex(
      (p) => p.product_id === productId,
    )
    if (productIndex === -1) return product.price

    const productExtras = selectedProductExtras[productId] || {}
    const totalExtrasPrice = Object.entries(productExtras).reduce(
      (total, [extraId, quantity]) => {
        const extra = extras.find((e) => e.id === extraId)
        if (extra) {
          total += extra.price * quantity
        }
        return total
      },
      0,
    )

    return product.price + totalExtrasPrice
  }

  const handleExtraChange = (
    productId: string,
    extraId: string,
    change: number,
  ) => {
    setSelectedProductExtras((prev) => {
      const productExtras = prev[productId] || {}
      const newQuantity = (productExtras[extraId] || 0) + change

      if (newQuantity <= 0) {
        const { [extraId]: _, ...rest } = productExtras
        return { ...prev, [productId]: rest }
      }

      return {
        ...prev,
        [productId]: { ...productExtras, [extraId]: newQuantity },
      }
    })
  }

  const handleSaveExtras = (productId: string) => {
    const productIndex = selectedProducts.findIndex(
      (p) => p.product_id === productId,
    )
    if (productIndex === -1) return

    const productExtras = selectedProductExtras[productId] || {}

    const formattedExtras = Object.entries(productExtras)
      .map(([id, quantity]) => {
        const extra = extras.find((e) => e.id === id)
        return extra
          ? {
              extra_id: extra.id,
              name: extra.name,
              price: extra.price,
              quantity,
            }
          : null
      })
      .filter(
        (
          extra,
        ): extra is {
          extra_id: string
          name: string
          price: number
          quantity: number
        } => extra !== null,
      )

    // Atualizando o valor total no form
    const totalPrice = calculateTotalPrice(productId)

    form.setValue(`order_items.${productIndex}.extras`, formattedExtras)
    form.setValue(`order_items.${productIndex}.product_price`, totalPrice)

    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="link" className="p-0">
          <Plus className="w-4 h-4 mr-1" /> Adicionais
        </Button>
      </SheetTrigger>
      <SheetContent className="px-0">
        <SheetHeader className="px-6">
          <SheetTitle>Adicionais para {product.name}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh_-_124px)] px-6">
          <div className="space-y-3 mt-4">
            {extras.map((extra) => (
              <div key={extra.id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span>{extra.name}</span>
                  <strong className="text-xs text-muted-foreground">
                    {formatCurrencyBRL(extra.price)}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={'secondary'}
                    size={'icon'}
                    onClick={() => handleExtraChange(product.id, extra.id, -1)}
                    disabled={!selectedProductExtras[product.id]?.[extra.id]}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-6 text-center text-xs">
                    {selectedProductExtras[product.id]?.[extra.id] || 0}
                  </span>
                  <Button
                    type="button"
                    variant={'secondary'}
                    size={'icon'}
                    onClick={() => handleExtraChange(product.id, extra.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="px-6">
          <Button
            className="mt-4 w-full"
            onClick={() => handleSaveExtras(product.id)}
          >
            Salvar Adicionais
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
