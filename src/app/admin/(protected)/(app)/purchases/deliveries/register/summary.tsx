import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CustomerType } from '@/models/customer'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { CustomersCombobox } from './customers/combobox'
import { LastPurchases } from './customers/last-purchases'
import { SelectedProducts } from './products/selected-products'

export function Summary({
  form,
  isPending,
  customers,
  products,
  extras,
}: {
  form: any
  isPending: boolean
  customers: CustomerType[]
  products: ProductType[]
  extras: ExtraType[]
}) {
  const customerFormSheetState = useState(false)
  const customerId = form.watch('customer_id')

  const purchaseType = form.watch('type')
  const discountValue = form.watch('total.discount') ?? 'R$ 0,00'
  const discount = stringToNumber(discountValue)
  const shippingPrice = form.watch('total.shipping_price') ?? 0

  const subtotal = form.watch('total.subtotal') ?? 0

  const totalAmount =
    subtotal +
    (purchaseType === 'DELIVERY' ? shippingPrice : 0) -
    (discount || 0)

  return (
    <Card className="space-y-6 p-0 lg:p-4 border-0 lg:border">
      <h1 className="text-lg font-bold">Resumo do pedido</h1>
      <CustomersCombobox
        customers={customers}
        form={form}
        customerFormSheetState={customerFormSheetState}
      />

      {customerId && <LastPurchases customerId={customerId} form={form} />}

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

      <div>
        <SelectedProducts form={form} products={products} extras={extras} />
      </div>

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tipo de pedido</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
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
          <FormItem className="space-y-3">
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
            <FormLabel>Obserações (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Insira observações..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col w-full">
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Criando pedido</span>
          </>
        ) : (
          <span>Criar pedido</span>
        )}
      </Button>
    </Card>
  )
}
