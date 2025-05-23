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
import { formatCurrencyBRL } from '@/lib/utils'
import { PaymentType } from '@/models/payment'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { closeCashSession } from './actions'
import { CashForm } from './cash-form'
import { CreditForm } from './credit-form'
import { DebitForm } from './debit-form'
import { PIXForm } from './pix-form'

export function CloseCashSession({
  cashBalance,
  totalBalance,
  cashSessionId,
  hasOpenPurchases,
  hasOpenTables,
  cashReceipts,
  payments,
}: {
  cashBalance: number
  totalBalance: number
  cashSessionId: string
  hasOpenPurchases: boolean
  hasOpenTables: boolean
  cashReceipts?: z.infer<typeof createCashReceiptsSchema>
  payments: PaymentType[]
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

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
  const computedPix = computedTotals.Pix || 0
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

  const form = useForm<z.infer<typeof closeCashSessionSchema>>({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: {
      pix_balance: cashBalance.toString() ?? '',
      credit_balance: cashBalance.toString() ?? '',
      debit_balance: cashBalance.toString() ?? '',
      cash_balance: declaredCash.toString() ?? '',
      closing_balance: totalBalance.toString() ?? '',
    },
  })

  const { execute, isPending } = useServerAction(closeCashSession, {
    onSuccess: () => {
      setIsSheetOpen(false)
      form.reset()
    },
    onError: (error) => {
      console.error(error)
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof closeCashSessionSchema>) {
    setIsClosing(true)
    execute(values)
    setIsClosing(false)
  }

  function handleCloseAndPrint() {
    const values = form.getValues()
    setIsPrinting(true)
    execute(values)
    window.open(
      `/admin/cash-register/print?cash_session_id=${cashSessionId}`,
      '_blank',
    )
    setIsPrinting(false)
  }

  useEffect(() => {
    form.setValue('cash_balance', declaredCash.toString())
    form.setValue('pix_balance', declaredPix.toString())
    form.setValue('credit_balance', declaredCredit.toString())
    form.setValue('debit_balance', declaredDebit.toString())
    form.setValue(
      'closing_balance',
      (declaredCash + declaredPix + declaredCredit + declaredDebit).toString(),
    )
  }, [declaredCash, declaredPix, declaredCredit, declaredDebit])

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
                      Computado: {formatCurrencyBRL(computedCash)}
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
                      Computado: {formatCurrencyBRL(computedPix)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />
                      <PIXForm />
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
                      Computado: {formatCurrencyBRL(computedCredit)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />
                      <CreditForm />
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
                      Computado: {formatCurrencyBRL(computedDebit)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />

                      <DebitForm />
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
                      Computado:{' '}
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
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Dinheiro + Recibos de cartão + PIX - Saídas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                disabled={isPending}
                onClick={handleCloseAndPrint}
              >
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
