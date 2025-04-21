import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrencyBRL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { StoreCustomerType } from '@/models/store-customer'
import { useSearchParams } from 'next/navigation'

export function Summary({
  form,
  isPending,
  customers,
  products,
  extras,
}: {
  form: any
  isPending: boolean
  customers?: StoreCustomerType[]
  products?: ProductType[]
  extras?: ExtraType[]
}) {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchase_id')

  const customerId = form.watch('customer_id')

  const subtotal = form.watch('total.subtotal') ?? 0

  const totalAmount = form.watch('total.total_amount')

  return (
    <Card className="flex flex-row justify-between gap-4 p-0 lg:p-4 border-0 w-full lg:border">
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <FormField
        control={form.control}
        name="total.shipping_price"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <FormField
        control={form.control}
        name="total.subtotal"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <div className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Tipo de pedido</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="DELIVERY" />
                    </FormControl>
                    <FormLabel className="font-normal">Entrega</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="TAKEOUT" />
                    </FormControl>
                    <FormLabel className="font-normal">Retirada</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Forma de pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="PIX" />
                    </FormControl>
                    <FormLabel className="font-normal">PIX</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="CREDIT" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Cartão de crédito
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="CASH" />
                    </FormControl>
                    <FormLabel className="font-normal">Dinheiro</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="DEBIT" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Cartão de débito
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="total.discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto (opcional)</FormLabel>
              <FormControl>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor do desconto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Insira observações..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="flex flex-col gap-4 w-full">
          {form.watch('payment_type') === 'CASH' && (
            <FormField
              control={form.control}
              name="total.change_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Troco (opcional)</FormLabel>
                  <FormControl>
                    <Input maskType="currency" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div>
            <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
              <span>Subtotal</span>
              <strong>{formatCurrencyBRL(subtotal)}</strong>
            </div>

            {form.watch('type') === 'DELIVERY' && (
              <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
                <span>Entrega</span>
                <strong>
                  {formatCurrencyBRL(form.watch('total.shipping_price') ?? 0)}
                </strong>
              </div>
            )}

            <div className="flex flex-row items-center justify-between w-full">
              <span>Total da venda</span>
              <strong>{formatCurrencyBRL(totalAmount ?? 0)}</strong>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>{purchaseId ? 'Atualizando' : 'Criando'} pedido</span>
            </>
          ) : (
            <span>{purchaseId ? 'Atualizar' : 'Criar'} pedido</span>
          )}
        </Button>
      </div>
    </Card>
  )
}
