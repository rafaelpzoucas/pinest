'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { createPurchaseFormSchema } from '../schemas'
import { Extras } from './extras'

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
        observations: '',
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
      <Label>Produtos</Label>
      {selectedProducts.length > 0 ? (
        selectedProducts.map((item, index) => {
          const product = products?.find((p) => p.id === item.product_id)
          if (!product) return null

          const quantity = item.quantity
          const totalPrice = item.product_price * quantity

          return (
            <Card
              key={index}
              className="space-y-2 bg-secondary/20 p-3 rounded-lg"
            >
              <header className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <span>{product.name}</span>
                  <strong className="text-xs text-muted-foreground">
                    {formatCurrencyBRL(totalPrice)}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
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
              </header>

              <ul>
                {item.extras.map((extra, index) => (
                  <li key={index}>
                    <div className="flex flex-row justify-between text-sm">
                      <span className="flex flex-row items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>{extra.quantity}</span>
                        {extra.name}
                      </span>
                      <span>{formatCurrencyBRL(extra.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {product.allows_extras && (
                <Extras
                  form={form}
                  extras={extras}
                  product={product}
                  selectedProducts={selectedProducts}
                />
              )}

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name={`purchase_items.${index}.observations` as const}
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        placeholder="Insira uma observação..."
                        {...field}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          )
        })
      ) : (
        <div className="text-muted-foreground text-sm">
          <p>Nenhum produto selecionado.</p>
        </div>
      )}

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
  )
}
