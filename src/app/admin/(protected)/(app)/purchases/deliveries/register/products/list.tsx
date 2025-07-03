import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatCurrencyBRL, normalizeString } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ProductType } from '@/models/product'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createPurchaseFormSchema } from '../schemas'

export function ProductsList({
  form,
  products,
  categories,
}: {
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
  products?: ProductType[]
  categories?: CategoryType[]
}) {
  const { control, watch, setValue } = form
  const { append, remove } = useFieldArray({
    control,
    name: 'purchase_items',
  })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const searchStr = normalizeString(search)

  const selectedProducts = watch('purchase_items') ?? []
  const purchaseType = watch('type')
  const shippingPrice = watch('total.shipping_price') ?? 0

  const deliveryFee = purchaseType === 'DELIVERY' ? shippingPrice : 0
  const discount = watch('total.discount') || '0'
  const parsedDiscount = parseFloat(discount)

  const handleAddItem = (product: ProductType, _change: number) => {
    append({
      product_id: product.id,
      quantity: 1,
      product_price: product.price,
      observations: [],
      extras: [],
    })

    toast(`${product.name} adicionado.`)
  }

  const filteredProducts =
    products &&
    products.filter((product) => {
      const { name, description, category_id: categoryId, sku } = product

      const matchesSearch =
        normalizeString(name).includes(searchStr) ||
        description.includes(searchStr) ||
        sku?.includes(searchStr)
      const matchesCategory = categoryFilter
        ? categoryId === categoryFilter
        : true

      return matchesSearch && matchesCategory
    })

  function handleStatusClick(status: string) {
    setCategoryFilter((prevStatus) => (prevStatus === status ? '' : status))
  }

  // Calcula o valor total da compra
  const selectedProductsAmount = selectedProducts
    .filter((item) => item.product_id)
    .reduce((total, item) => {
      const product = products?.find((p) => p.id === item.product_id)
      return total + (product ? item.product_price * item.quantity : 0)
    }, 0)

  const totalAmount = selectedProductsAmount + deliveryFee - parsedDiscount

  useEffect(() => {
    setValue('total.total_amount', totalAmount)
  }, [totalAmount])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Buscar pedido..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[calc(100vh_-_48px_-_28px_-_36px_-_32px)]">
          <div className="flex flex-row flex-wrap gap-4">
            {categories?.map((category) => (
              <Card
                key={category.id}
                className={cn(
                  'p-4 select-none cursor-pointer',
                  categoryFilter === category.id
                    ? 'bg-primary text-primary-foreground'
                    : '',
                )}
                onClick={() => handleStatusClick(category.id)}
              >
                {category.name}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 w-full mt-4">
            {filteredProducts &&
              filteredProducts.length > 0 &&
              filteredProducts?.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-row justify-between p-4 cursor-pointer hover:bg-secondary/30"
                  onClick={() => handleAddItem(product, 1)}
                >
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <strong className="text-xs text-muted-foreground">
                      {formatCurrencyBRL(product.price)}
                    </strong>
                  </div>
                  <div
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    })}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                </Card>
              ))}
          </div>
        </ScrollArea>

        {filteredProducts?.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Search className="w-32 h-32" />
            <p className="text-center">
              Nenhum produto &quot;{search}&quot; encontrado.
            </p>
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="total.total_amount"
        render={({ field }) => <input type="hidden" {...field} />}
      />
    </div>
  )
}
