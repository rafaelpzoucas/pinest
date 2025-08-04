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
import { TableType } from '@/models/table'
import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { createTable, updateTable } from './actions'
import { SelectedProducts } from './products/selected-products'
import { createTableSchema } from './schemas'
import { Summary } from './summary'

export function CreateSaleForm({
  storeId,
  table,
}: {
  storeId?: string
  table: TableType
}) {
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
        toast.error(err.message)
      },
    })
  const { execute: executeUpdateTable, isPending: isUpdatePending } =
    useServerAction(updateTable, {
      onSuccess: () => {
        toast.success('Mesa atualizada com sucesso!')
      },
      onError: () => {
        toast.error('Ocorreu um erro ao atualizar a mesa.')
      },
    })

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

      return
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
                  form={form}
                  isCreatePending={isCreatePending}
                  isUpdatePending={isUpdatePending}
                  table={table}
                  onSubmit={onSubmit}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </Card>

        <div className="hidden lg:flex w-full">
          <Summary
            form={form}
            isCreatePending={isCreatePending}
            isUpdatePending={isUpdatePending}
            table={table}
            onSubmit={onSubmit}
          />
        </div>

        <SelectedProducts form={form} storeId={storeId} />
      </form>
    </Form>
  )
}
