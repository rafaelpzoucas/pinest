'use client'

import {
  Sheet,
  SheetClose,
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
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { printReportReceipt } from '../config/printing/actions'
import { closeCashSession } from './actions'
import { CashForm } from './cash-form'
import { CreditForm } from './credit-form'
import { DebitForm } from './debit-form'
import { PIXForm } from './pix-form'

// Função utilitária para retornar string vazia se o valor for zero
function emptyIfZero(value: number) {
  return value === 0 ? '' : value.toString()
}

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
  const [sheet, setSheet] = useQueryState('sheet', parseAsString)
  const isSheetOpen = sheet === 'close-cash'
  const setIsSheetOpen = (open: boolean) => setSheet(open ? 'close-cash' : null)
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
      pix_balance: emptyIfZero(declaredPix),
      credit_balance: emptyIfZero(declaredCredit),
      debit_balance: emptyIfZero(declaredDebit),
      cash_balance: emptyIfZero(declaredCash),
      closing_balance: emptyIfZero(totalDeclaredInitial),
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

  // Inicializa os valores apenas uma vez quando o componente monta
  useEffect(() => {
    // Só inicializa se os campos estiverem vazios (primeira vez)
    const currentValues = form.getValues()
    if (
      !currentValues.cash_balance &&
      !currentValues.pix_balance &&
      !currentValues.credit_balance &&
      !currentValues.debit_balance
    ) {
      form.setValue('cash_balance', emptyIfZero(declaredCash))
      form.setValue('pix_balance', emptyIfZero(declaredPix))
      form.setValue('credit_balance', emptyIfZero(declaredCredit))
      form.setValue('debit_balance', emptyIfZero(declaredDebit))
      form.setValue('closing_balance', emptyIfZero(totalDeclaredInitial))
    }
  }, []) // Remove as dependências para executar apenas uma vez

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

  // Função utilitária para abrir um filho e fechar o pai
  function handleOpenChildSheet(sheetKey: string) {
    setSheet(sheetKey)
  }

  // Função utilitária para controlar reabertura do pai ao fechar o filho
  function handleChildSheetChange(open: boolean, sheetKey: string) {
    if (!open) {
      setSheet('close-cash')
    }
  }

  // Função para limpar campos e permitir entrada manual
  function handleClearFields() {
    form.setValue('cash_balance', '')
    form.setValue('pix_balance', '')
    form.setValue('credit_balance', '')
    form.setValue('debit_balance', '')
    form.setValue('closing_balance', '')
  }

  return (
    <>
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
          <SheetHeader className="items-start mb-4">
            <div className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">Fechamento de caixa</SheetTitle>
            </div>
            <SheetDescription className="!mt-0 text-left">
              Os valores podem ser editados manualmente ou preenchidos através
              dos recibos.
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
                        {/* Botão para abrir o Sheet de CashForm */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => handleOpenChildSheet('cash-form')}
                        >
                          <Plus />
                        </Button>
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
                        {/* Botão para abrir o Sheet de PIXForm */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => handleOpenChildSheet('pix-form')}
                        >
                          <Plus />
                        </Button>
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
                        {/* Botão para abrir o Sheet de CreditForm */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => handleOpenChildSheet('credit-form')}
                        >
                          <Plus />
                        </Button>
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
                        {/* Botão para abrir o Sheet de DebitForm */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => handleOpenChildSheet('debit-form')}
                        >
                          <Plus />
                        </Button>
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
                      <FormMessage className="text-amber-600">
                        ⚠️ Diferença: {formatCurrencyBRL(difference)} -
                        Verifique os valores antes de fechar
                      </FormMessage>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-2">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFields}
                    disabled={isPending || isPending}
                  >
                    Limpar campos
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={isPending || isPending || difference !== 0}
                  className="w-full lg:w-auto"
                >
                  {isPrinting || isPending ? (
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

      {/* Sheets filhos controlados pelo pai */}
      <CashForm
        receipts={cashReceiptsMoney}
        open={sheet === 'cash-form'}
        setOpen={(open) => handleChildSheetChange(open, 'cash-form')}
      />
      <PIXForm
        receipts={pixReceipts}
        open={sheet === 'pix-form'}
        setOpen={(open) => handleChildSheetChange(open, 'pix-form')}
      />
      <CreditForm
        receipts={creditReceipts}
        open={sheet === 'credit-form'}
        setOpen={(open) => handleChildSheetChange(open, 'credit-form')}
      />
      <DebitForm
        receipts={debitReceipts}
        open={sheet === 'debit-form'}
        setOpen={(open) => handleChildSheetChange(open, 'debit-form')}
      />
    </>
  )
}
