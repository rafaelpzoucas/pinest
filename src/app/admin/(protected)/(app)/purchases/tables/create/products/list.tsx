import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ProductType } from '@/models/product'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { createTableSchema } from '../schemas'

export function ProductsList({
  form,
  products,
  categories,
}: {
  form: UseFormReturn<z.infer<typeof createTableSchema>>
  products: ProductType[]
  categories: CategoryType[]
}) {
  const { control, register, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchase_items',
  })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const normalizeString = (str: string | undefined) => str?.toLowerCase() || ''

  const searchStr = normalizeString(search)

  const selectedProducts = watch('purchase_items') ?? []

  const handleQuantityChange = (product: ProductType, change: number) => {
    const index = selectedProducts.findIndex((p) => p.product_id === product.id)

    if (index === -1 && change > 0) {
      // Adiciona o produto ao carrinho se ainda não estiver
      append({
        product_id: product.id,
        quantity: 1,
        product_price: product.price,
        observations: '',
        extras: [],
      })
    } else if (index !== -1) {
      const selectedProduct = selectedProducts[index]

      // Verifica se o produto já tem extras. Se sim, cria uma nova entrada.
      if (selectedProduct.extras?.length > 0) {
        // Adiciona um novo item no carrinho, sem alterar a quantidade do item existente
        append({
          product_id: product.id,
          quantity: 1,
          product_price: product.price,
          observations: '',
          extras: [],
        })
      } else {
        const newQuantity = selectedProduct.quantity + change

        if (newQuantity > 0) {
          setValue(`purchase_items.${index}.quantity`, newQuantity)
        } else {
          remove(index) // Remove o produto se a quantidade for 0
        }
      }
    }
  }

  const filteredProducts =
    products &&
    products.filter((product) => {
      const { id, name, description, category_id: categoryId, sku } = product

      const matchesSearch =
        normalizeString(name).includes(searchStr) ||
        id.includes(searchStr) ||
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

        <div className="flex flex-row gap-4">
          {categories.map((category) => (
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

        <ScrollArea className="h-[calc(100vh_-_1rem_-_68px_-_24px_-_12rem_-_1rem)]">
          <div className="grid grid-cols-3 gap-2 w-full">
            {filteredProducts.length > 0 &&
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-row justify-between p-4 cursor-pointer hover:bg-secondary/30"
                  onClick={() => handleQuantityChange(product, 1)}
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

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Search className="w-32 h-32" />
            <p className="text-center">
              Nenhum produto &quot;{search}&quot; encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
