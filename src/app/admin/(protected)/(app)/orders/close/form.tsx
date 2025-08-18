'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { PaymentType } from '@/models/payment'
import { StoreCustomerType } from '@/models/store-customer'
import { useCloseBillStore } from '@/stores/closeBillStore'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { closeBills, createPayment } from './actions'
import { CustomersCombobox } from './customers/combobox'
import { createPaymentSchema } from './schemas'

export function CloseBillForm({
  payments,
  saleDiscount = 0,
  storeCustomers,
  isPermissionGranted,
}: {
  payments: PaymentType[]
  saleDiscount?: number
  storeCustomers?: StoreCustomerType[]
  isPermissionGranted: boolean
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tab = searchParams.get('tab')

  const { rowSelection, setRowSelection, items, updateItemPayment } =
    useCloseBillStore()

  const [enterAmount, setEnterAmount] = useState('')
  const customerFormSheetState = useState(false)

  const selectedItems = items.filter((_, index) => rowSelection[index])

  // 1. Define your form.
  const form = useForm<z.infer<typeof createPaymentSchema>>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: '',
      discount: '',
      status: 'confirmed',
      table_id: searchParams.get('table_id') ?? undefined,
      order_id: searchParams.get('order_id') ?? undefined,
    },
  })

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  )
  const totalDiscount =
    payments.reduce((sum, item) => sum + item.discount, 0) + saleDiscount
  const totalAmountPaid = payments.reduce((sum, item) => sum + item.amount, 0)
  const remainingAmount = totalAmount - totalDiscount - totalAmountPaid

  const totalSelectedAmount = selectedItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  )

  const isCashPayment = form.watch('payment_type') === 'CASH'
  const isDeferredPayment = form.watch('payment_type') === 'DEFERRED'

  const discount = stringToNumber(form.watch('discount'))
  const amount = stringToNumber(form.watch('amount')) ?? 0
  const amountToPay = amount
  const isCloseBill = amountToPay >= remainingAmount

  const changeAmount = stringToNumber(enterAmount) - amountToPay

  const { execute: executeCreatePayment, isPending: isCreatePending } =
    useServerAction(createPayment, {
      onSuccess: () => {
        router.refresh()
      },
      onError: (error) => {
        console.error('Error ao salvar pagamento:', error)
      },
    })
  const { execute: executeCloseBill, isPending: isCloseBillPending } =
    useServerAction(closeBills)

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createPaymentSchema>) {
    const [data, err] = await executeCreatePayment(values)

    if (err && !data) {
      console.error({ err })
      return null
    }

    values?.items?.forEach((item) => {
      updateItemPayment(item.id, true)
    })

    if (isCloseBill) {
      const [closeBillData, closeBillError] = await executeCloseBill(values)

      if (closeBillError && !closeBillData) {
        console.error({ closeBillError })
        return null
      }

      router.push(`/admin/orders?tab=${tab}`)
    }

    form.reset()
    setEnterAmount('')
    setRowSelection({})
  }

  useEffect(() => {
    const selectedAmount =
      totalSelectedAmount > remainingAmount
        ? remainingAmount
        : totalSelectedAmount
    form.setValue('amount', selectedAmount.toString())
    form.setValue(
      'items',
      selectedItems.map((item) => ({ id: item.id })),
    )
  }, [totalSelectedAmount])

  useEffect(() => {
    form.setValue('amount', (totalSelectedAmount - discount).toString())
  }, [discount])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <Card className="space-y-6 p-4">
          <h1 className="text-lg font-bold">Resumo do pagamento</h1>

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto</FormLabel>
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receber</FormLabel>
                <FormControl>
                  <Input
                    maskType="currency"
                    placeholder="Insira o valor a receber..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => <Input type="hidden" {...field} />}
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

                    {isPermissionGranted && (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="DEFERRED" />
                        </FormControl>
                        <FormLabel className="font-normal">A Prazo</FormLabel>
                      </FormItem>
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isCashPayment && (
            <div>
              <FormItem>
                <Label>Valor recebido (opcional)</Label>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor pago..."
                  value={enterAmount}
                  onChange={(e) => setEnterAmount(e.target.value)}
                />
                <FormDescription>
                  Para calcular o valor do troco
                </FormDescription>
              </FormItem>

              {stringToNumber(enterAmount) > 0 && (
                <div className="flex flex-row items-center justify-between py-2">
                  <p>Valor do troco:</p>
                  <strong>
                    {formatCurrencyBRL(changeAmount > 0 ? changeAmount : 0)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {isDeferredPayment && (
            <CustomersCombobox
              storeCustomers={storeCustomers}
              form={form}
              customerFormSheetState={customerFormSheetState}
            />
          )}

          <header className="flex-1 text-sm text-muted-foreground border-t pt-2">
            <div>
              <div className="flex flex-row items-center justify-between w-full">
                <span>Total</span>
                <strong>{formatCurrencyBRL(totalAmount ?? 0)}</strong>
              </div>
              <div className="flex flex-row items-center justify-between w-full">
                <span>Total pago</span>
                <strong>{formatCurrencyBRL(totalAmountPaid ?? 0)}</strong>
              </div>
              <div className="flex flex-row items-center justify-between w-full">
                <span>Total desconto</span>
                <strong>{formatCurrencyBRL(totalDiscount ?? 0)}</strong>
              </div>
              <div className="flex flex-row items-center justify-between w-full">
                <span>A pagar</span>
                <strong>{formatCurrencyBRL(remainingAmount)}</strong>
              </div>
            </div>
          </header>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isCreatePending || isCloseBillPending || amountToPay === 0
            }
          >
            {isCreatePending || isCloseBillPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>
                  Confirmando pagamento {isCloseBill ? 'e fechando' : ''}
                </span>
              </>
            ) : (
              <span>
                {isCloseBill
                  ? 'Confirmar e fechar venda'
                  : 'Confirmar pagamento'}
              </span>
            )}
          </Button>
        </Card>
      </form>
    </Form>
  )
}
