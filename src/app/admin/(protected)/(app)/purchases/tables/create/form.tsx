'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatCurrencyBRL } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { TableType } from '@/models/table'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { checkTableExists, createTable, updateTable } from './actions'
import { ProductsList } from './products/list'
import { SelectedProducts } from './products/selected-products'
import { createTableSchema } from './schemas'

export function CreateSaleForm({
  products,
  categories,
  extras,
  table,
}: {
  products: ProductType[]
  categories: CategoryType[]
  extras: ExtraType[]
  table: TableType
}) {
  const router = useRouter()

  // 1. Define your form.
  const form = useForm<z.infer<typeof createTableSchema>>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      number: table?.number?.toString() ?? undefined,
      purchase_items: [],
    },
  })

  const { execute: executeCreateTable, isPending: isCreatePending } =
    useServerAction(createTable)
  const { execute: executeUpdateTable, isPending: isUpdatePending } =
    useServerAction(updateTable)

  const purchaseItems = form.watch('purchase_items')

  const totalAmount = purchaseItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  )

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createTableSchema>) {
    if (table?.id) {
      const [data, err] = await executeUpdateTable({ id: table.id, ...values })

      if (err && !data) {
        console.error({ err })
        return null
      }

      const tableId = data?.updatedItems[0].table_id

      window.open(`/admin/purchases/tables/${tableId}/receipt`, '_blank')

      router.push('/admin/purchases?tab=tables')
    }

    const [exists] = await checkTableExists({ number: values.number })

    if (exists) {
      form.setError('number', {
        type: 'manual',
        message: 'Esta mesa já está aberta.',
      })
      return
    }

    const [data, err] = await executeCreateTable(values)

    if (err && !data) {
      console.error({ err })
      return null
    }

    const createdPurchase = data?.createdTable

    window.open(
      `/admin/purchases/tables/${createdPurchase.id}/receipt`,
      '_blank',
    )

    router.push('/admin/purchases?tab=tables')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-[2fr_1fr] items-start gap-8"
      >
        <aside className="sticky top-4">
          <Card className="space-y-6 p-4 h-[calc(100vh_-_1rem_-_5rem)]">
            <h1 className="text-lg font-bold">Produtos</h1>
            <ProductsList
              form={form}
              products={products}
              categories={categories}
            />
          </Card>
        </aside>
        <Card className="space-y-6 p-4">
          <h1 className="text-lg font-bold">Resumo da mesa</h1>

          {table?.id ? (
            <div className="flex flex-row items-center justify-between w-full">
              <strong className="text-xl">Mesa #{table.number}</strong>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesa</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o número da mesa" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <SelectedProducts form={form} products={products} extras={extras} />

          <div className="flex flex-col w-full">
            <div className="flex flex-row items-center justify-between w-full">
              <span>Total da venda</span>
              <strong>{formatCurrencyBRL(totalAmount ?? 0)}</strong>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isCreatePending || isUpdatePending}
          >
            {isCreatePending || isUpdatePending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{table?.id ? 'Atualizando' : 'Criando'} mesa</span>
              </>
            ) : (
              <span>{table?.id ? 'Atualizar' : 'Criar'} mesa</span>
            )}
          </Button>
        </Card>
      </form>
    </Form>
  )
}
