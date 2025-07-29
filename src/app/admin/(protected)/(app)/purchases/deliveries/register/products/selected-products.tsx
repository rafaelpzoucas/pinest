'use client'

import { ExtrasInput } from '@/components/extras-input'
import { ObservationsInput } from '@/components/observations-input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { stringToNumber } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { Boxes, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { createPurchaseFormSchema } from '../schemas'

export function SelectedProducts({
  form,
  products,
  extras,
}: {
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
  products?: ProductType[]
  extras?: ExtraType[]
}) {
  const { control, setValue } = form
  const { append, remove } = useFieldArray({
    control,
    name: 'purchase_items',
  })

  const selectedProducts = form.watch('purchase_items') ?? []

  const handleQuantityChange = (
    product: ProductType,
    change: number,
    index: number,
  ) => {
    const currentProduct = selectedProducts[index]

    if (index === -1 && change > 0) {
      append({
        product_id: product.id,
        quantity: 1,
        product_price: product.price,
        observations: [],
        extras: [],
      })
    } else if (index !== -1) {
      const newQuantity = currentProduct.quantity + change

      if (newQuantity > 0) {
        setValue(`purchase_items.${index}.quantity`, newQuantity)
      } else {
        remove(index)
      }
    }
  }

  return (
    <div className="space-y-2">
      {selectedProducts.length > 0 ? (
        selectedProducts.map((item, index) => {
          const product = products?.find((p) => p.id === item.product_id)
          if (!product) return null

          const quantity = item.quantity
          const totalPrice = item.product_price * quantity

          return (
            <Card
              key={index}
              className="flex flex-col lg:grid grid-cols-[2fr_2fr_2fr] gap-4 items-start justify-between
                bg-secondary/20 p-3 rounded-lg"
            >
              <div className="flex flex-row w-full gap-2">
                <div className="flex flex-col gap-1">
                  <span>{product.name}</span>
                  <div className="flex items-center gap-1">
                    <Input
                      maskType="currency"
                      className="w-full max-w-28"
                      value={item.product_price}
                      onChange={(e) =>
                        setValue(
                          `purchase_items.${index}.product_price`,
                          stringToNumber(e.target.value),
                        )
                      }
                    />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setValue(
                              `purchase_items.${index}.product_price`,
                              product.price,
                            )
                          }}
                        >
                          <RotateCcw />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restaurar valor</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto lg:mx-auto">
                  <Button
                    type="button"
                    variant={'secondary'}
                    size={'icon'}
                    onClick={() => handleQuantityChange(product, -1, index)}
                    disabled={quantity === 0}
                  >
                    {quantity === 1 ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </Button>
                  <span className="w-6 text-center text-xs">{quantity}</span>
                  <Button
                    type="button"
                    variant={'secondary'}
                    size={'icon'}
                    onClick={() => handleQuantityChange(product, 1, index)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {product.allows_extras && (
                <ExtrasInput
                  availableExtras={extras || []}
                  value={item.extras}
                  onChange={(newExtras) =>
                    setValue(`purchase_items.${index}.extras`, newExtras)
                  }
                />
              )}

              <ObservationsInput
                value={item.observations || []}
                onChange={(newObs) =>
                  setValue(`purchase_items.${index}.observations`, newObs)
                }
              />
            </Card>
          )
        })
      ) : (
        <div
          className="flex flex-col gap-4 items-center justify-center text-muted-foreground text-sm
            w-full"
        >
          <Boxes className="w-32 h-32" />
          <p>Nenhum produto selecionado.</p>
          <FormField
            control={form.control}
            name="purchase_items"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
