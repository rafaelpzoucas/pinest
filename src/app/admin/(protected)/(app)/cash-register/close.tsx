'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { closeCashSessionSchema, createCashReceiptsSchema } from './schemas'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  buildProductsSoldReportText,
  buildSalesReportText,
} from '@/lib/receipts'
import { formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { PaymentType } from '@/models/payment'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { printReportReceipt } from '../config/printing/actions'
import { closeCashSession } from './actions'
import { CashForm } from './cash-form'
import { CreditForm } from './credit-form'
import { DebitForm } from './debit-form'
import { PIXForm } from './pix-form'

export function CloseCashSession({
  cashSessionId,
  hasOpenPurchases,
  hasOpenTables,
  cashReceipts,
  payments,
  reports,
}: {
  cashSessionId: string
  hasOpenPurchases: boolean
  hasOpenTables: boolean
  cashReceipts?: z.infer<typeof createCashReceiptsSchema>
  payments: PaymentType[]
  reports: any
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const cashReceiptsMoney =
    cashReceipts?.filter((receipt) => receipt.type.startsWith('cash_')) || []
  const pixReceipts =
    cashReceipts?.filter((receipt) => receipt.type === 'pix') || []
  const creditReceipts =
    cashReceipts?.filter((receipt) => receipt.type === 'credit') || []
  const debitReceipts =
    cashReceipts?.filter((receipt) => receipt.type === 'debit') || []

  const initialAmount = payments.find(
    (payment) => payment.description === 'Abertura de caixa',
  )?.amount

  const computedTotals = payments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT: 'Credito',
        DEBIT: 'Debito',
        CASH: 'Dinheiro',
        PIX: 'PIX',
        DEFERRED: 'Prazo',
      } as const

      const key = typeMap[payment.payment_type as keyof typeof typeMap]

      if (key) {
        acc[key] = (acc[key] || 0) + payment.amount
      }

      return acc
    },
    {} as Record<string, number>,
  )

  const computedCash = (initialAmount || 0) + (computedTotals.Dinheiro || 0)
  const computedPix = computedTotals.PIX || 0
  const computedCredit = computedTotals.Credito || 0
  const computedDebit = computedTotals.Debito || 0

  const declaredCash = cashReceiptsMoney.reduce((acc, receipt) => {
    return acc + receipt.total
  }, 0)
  const declaredPix = pixReceipts.reduce((acc, receipt) => {
    return acc + receipt.total
  }, 0)
  const declaredCredit = creditReceipts.reduce((acc, receipt) => {
    return acc + receipt.total
  }, 0)
  const declaredDebit = debitReceipts.reduce((acc, receipt) => {
    return acc + receipt.total
  }, 0)

  const totalDeclaredInitial =
    declaredCash + declaredPix + declaredCredit + declaredDebit

  const form = useForm<z.infer<typeof closeCashSessionSchema>>({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: {
      pix_balance: declaredPix.toString(),
      credit_balance: declaredCredit.toString(),
      debit_balance: declaredDebit.toString(),
      cash_balance: declaredCash.toString(),
      closing_balance: totalDeclaredInitial.toString(),
    },
  })

  const totalComputed =
    computedCash + computedPix + computedCredit + computedDebit
  const totalDeclared =
    stringToNumber(form.watch('cash_balance')) +
    stringToNumber(form.watch('pix_balance')) +
    stringToNumber(form.watch('credit_balance')) +
    stringToNumber(form.watch('debit_balance'))

  const difference = totalDeclared - totalComputed

  const { execute, isPending } = useServerAction(closeCashSession, {
    onSuccess: () => {
      setIsSheetOpen(false)
      form.reset()

      executePrintReceipt({
        text: buildSalesReportText(reports.salesReport),
      })

      executePrintReceipt({
        text: buildProductsSoldReportText(reports.productsSold),
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const { execute: executePrintReceipt } = useServerAction(printReportReceipt)

  function onSubmit(values: z.infer<typeof closeCashSessionSchema>) {
    setIsPrinting(true)
    execute(values)
    setIsPrinting(false)
  }

  useEffect(() => {
    form.setValue('cash_balance', declaredCash.toString())
    form.setValue('pix_balance', declaredPix.toString())
    form.setValue('credit_balance', declaredCredit.toString())
    form.setValue('debit_balance', declaredDebit.toString())
    form.setValue('closing_balance', totalDeclared.toString())
  }, [declaredCash, declaredPix, declaredCredit, declaredDebit])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'cash_balance' ||
        name === 'pix_balance' ||
        name === 'credit_balance' ||
        name === 'debit_balance'
      ) {
        const newTotal =
          stringToNumber(value.cash_balance) +
          stringToNumber(value.pix_balance) +
          stringToNumber(value.credit_balance) +
          stringToNumber(value.debit_balance)

        form.setValue('closing_balance', newTotal.toString())
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {hasOpenPurchases || hasOpenTables ? (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button className="cursor-not-allowed opacity-50">
                Fechar caixa
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Você ainda tem pedidos ou mesas em aberto.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <SheetTrigger className={buttonVariants()}>Fechar caixa</SheetTrigger>
      )}
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Fechamento de caixa</SheetTitle>
          <SheetDescription>
            Você confirma fechamento do seu caixa?
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="cash_balance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row justify-between">
                    <FormLabel>Dinheiro</FormLabel>
                    <FormDescription>
                      Esperado: {formatCurrencyBRL(computedCash)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />

                      <CashForm receipts={cashReceiptsMoney} />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pix_balance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row justify-between">
                    <FormLabel>PIX</FormLabel>

                    <FormDescription>
                      Esperado: {formatCurrencyBRL(computedPix)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />
                      <PIXForm receipts={pixReceipts} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credit_balance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row justify-between">
                    <FormLabel>Cartão de crédito</FormLabel>

                    <FormDescription>
                      Esperado: {formatCurrencyBRL(computedCredit)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />
                      <CreditForm receipts={creditReceipts} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="debit_balance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row justify-between">
                    <FormLabel>Cartão de débito</FormLabel>

                    <FormDescription>
                      Esperado: {formatCurrencyBRL(computedDebit)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />

                      <DebitForm receipts={debitReceipts} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closing_balance"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row justify-between">
                    <FormLabel>Saldo final</FormLabel>
                    <FormDescription>
                      Esperado:{' '}
                      {formatCurrencyBRL(
                        computedCash +
                          computedPix +
                          computedCredit +
                          computedDebit,
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      maskType="currency"
                      placeholder="Insira o valor final..."
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Dinheiro + Recibos de cartão + PIX - Saídas
                  </FormDescription>
                  {difference !== 0 ? (
                    <FormMessage>Diferença: {difference}</FormMessage>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-2">
              <Button type="submit" disabled={isPending || difference !== 0}>
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Fechando caixa</span>
                  </>
                ) : (
                  'Fechar caixa e imprimir'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
