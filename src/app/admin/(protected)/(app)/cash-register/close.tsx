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
import { closeCashSessionSchema } from './schemas'

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
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useServerAction } from 'zsa-react'
import { closeCashSession } from './actions'
import { CashForm } from './cash-form'
import { PIXForm } from './pix-form'

export function CloseCashSession({
  cashBalance,
  totalBalance,
  cashSessionId,
  hasOpenPurchases,
  hasOpenTables,
}: {
  cashBalance: number
  totalBalance: number
  cashSessionId: string
  hasOpenPurchases: boolean
  hasOpenTables: boolean
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const form = useForm<z.infer<typeof closeCashSessionSchema>>({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: {
      pix_balance: cashBalance.toString() ?? '',
      credit_balance: cashBalance.toString() ?? '',
      debit_balance: cashBalance.toString() ?? '',
      cash_balance: cashBalance.toString() ?? '',
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
                      Computado: {formatCurrencyBRL(100)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <Input
                        maskType="currency"
                        placeholder="Insira o valor final..."
                        {...field}
                      />

                      <CashForm />
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
                      Computado: {formatCurrencyBRL(100)}
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
                      Computado: {formatCurrencyBRL(100)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      maskType="currency"
                      placeholder="Insira o valor final..."
                      {...field}
                    />
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
                      Computado: {formatCurrencyBRL(100)}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      maskType="currency"
                      placeholder="Insira o valor final..."
                      {...field}
                    />
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
                      Computado: {formatCurrencyBRL(100)}
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
