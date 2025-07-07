'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { TableType } from '@/models/table'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { createTable, updateTable } from './actions'
import { ProductsList } from './products/list'
import { SelectedProducts } from './products/selected-products'
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
  const searchParams = useSearchParams()

  const isEdit = searchParams.get('edit') === 'true'

  // 1. Define your form.
  const form = useForm<z.infer<typeof createTableSchema>>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      number: table?.number?.toString() ?? undefined,
      description: table?.description ?? undefined,
      purchase_items: isEdit ? table.purchase_items : [],
    },
  })

  const purchaseItems = form.watch('purchase_items')

  const { execute: executeCreateTable, isPending: isCreatePending } =
    useServerAction(createTable, {
      onError: ({ err }) => {
        toast(err.message)
      },
    })
  const { execute: executeUpdateTable, isPending: isUpdatePending } =
    useServerAction(updateTable)

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createTableSchema>) {
    if (table?.id) {
      const [data, err] = await executeUpdateTable({
        id: table.id,
        is_edit: isEdit,
        ...values,
      })

      if (err && !data) {
        console.error({ err })
        return null
      }
    }

    const [data, err] = await executeCreateTable(values)

    if (err && !data) {
      console.error({ err })
      return null
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-4 w-full h-full"
      >
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
                  onSubmit={onSubmit}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </Card>

        <div className="hidden lg:flex w-full">
          <Summary
            extras={extras}
            form={form}
            isCreatePending={isCreatePending}
            isUpdatePending={isUpdatePending}
            products={products}
            table={table}
            onSubmit={onSubmit}
          />
        </div>

        <Sheet>
          <SheetTrigger className={cn(buttonVariants(), 'w-fit')}>
            <Plus className="w-4 h-4" />
            Adicionar produtos
          </SheetTrigger>
          <SheetContent className="!max-w-2xl space-y-2">
            <SheetHeader className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">Produtos</SheetTitle>
            </SheetHeader>

            <ProductsList
              form={form}
              categories={categories}
              products={products}
            />
          </SheetContent>
        </Sheet>

        <ScrollArea className="w-full h-[calc(100dvh_-_32px_-_130px_-_32px)]">
          <Card className="flex flex-col h-full">
            <CardContent className="p-4">
              <SelectedProducts
                form={form}
                extras={extras}
                products={products}
              />
            </CardContent>
          </Card>
        </ScrollArea>
      </form>
    </Form>
  )
}
