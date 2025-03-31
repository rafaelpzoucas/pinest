'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { TableType } from '@/models/table'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { checkTableExists, createTable, updateTable } from './actions'
import { ProductsList } from './products/list'
import { createTableSchema } from './schemas'
import { Summary } from './summary'

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

  const purchaseItems = form.watch('purchase_items')

  const { execute: executeCreateTable, isPending: isCreatePending } =
    useServerAction(createTable)
  const { execute: executeUpdateTable, isPending: isUpdatePending } =
    useServerAction(updateTable)

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
        className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] items-start gap-8"
      >
        <aside className="sticky top-4">
          <Card className="space-y-6 p-4 lg:h-[calc(100vh_-_1rem_-_5rem)]">
            <h1 className="text-lg font-bold">Produtos</h1>
            <ProductsList
              form={form}
              products={products}
              categories={categories}
            />
          </Card>
        </aside>

        <Card className="flex lg:hidden flex-col gap-4 p-4 fixed bottom-2 left-2 right-2">
          <p>{purchaseItems.length} Produto(s) selecionado(s)</p>

          <Sheet>
            <SheetTrigger
              className={buttonVariants()}
              disabled={purchaseItems.length === 0}
            >
              Continuar
            </SheetTrigger>
            <SheetContent className="p-0">
              <ScrollArea className="h-dvh p-4">
                <SheetTitle>
                  <SheetClose>
                    <X />
                  </SheetClose>
                </SheetTitle>

                <Summary
                  extras={extras}
                  form={form}
                  isCreatePending={isCreatePending}
                  isUpdatePending={isUpdatePending}
                  products={products}
                  table={table}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </Card>

        <div className="hidden lg:block">
          <Summary
            extras={extras}
            form={form}
            isCreatePending={isCreatePending}
            isUpdatePending={isUpdatePending}
            products={products}
            table={table}
          />
        </div>
      </form>
    </Form>
  )
}
