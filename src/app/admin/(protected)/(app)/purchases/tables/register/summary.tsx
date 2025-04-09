import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { TableType } from '@/models/table'
import { Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { SelectedProducts } from './products/selected-products'
import { createTableSchema } from './schemas'

export function Summary({
  products,
  extras,
  form,
  table,
  isCreatePending,
  isUpdatePending,
}: {
  products: ProductType[]
  extras: ExtraType[]
  form: UseFormReturn<z.infer<typeof createTableSchema>>
  table: TableType
  isCreatePending: boolean
  isUpdatePending: boolean
}) {
  const purchaseItems = form.watch('purchase_items')

  const totalAmount = purchaseItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  )
  return (
    <Card className="space-y-6 p-4">
      <h1 className="text-lg font-bold">Resumo da mesa</h1>

      {table?.id ? (
        <div className="flex flex-row items-center justify-between w-full">
          <strong className="text-xl">Mesa #{table.number}</strong>
          <p>{table.description}</p>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_4fr] gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mesa</FormLabel>
                <FormControl>
                  <Input placeholder="Nº" {...field} autoFocus />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira uma descrição para a mesa"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
  )
}
