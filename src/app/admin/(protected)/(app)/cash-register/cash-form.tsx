'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatCurrencyBRL } from '@/lib/utils'
import { useServerAction } from 'zsa-react'
import { upsertCashReceipts } from './actions'
import { createCashReceiptsSchema } from './schemas'

const MONEY_VALUES = {
  cash_005: 0.05,
  cash_010: 0.1,
  cash_025: 0.25,
  cash_050: 0.5,
  cash_1: 1,
  cash_2: 2,
  cash_5: 5,
  cash_10: 10,
  cash_20: 20,
  cash_50: 50,
  cash_100: 100,
  cash_200: 200,
} as const

const formSchema = z.object({
  cash_005: z.number(),
  cash_010: z.number(),
  cash_025: z.number(),
  cash_050: z.number(),
  cash_1: z.number(),
  cash_2: z.number(),
  cash_5: z.number(),
  cash_10: z.number(),
  cash_20: z.number(),
  cash_50: z.number(),
  cash_100: z.number(),
  cash_200: z.number(),
})

export function CashForm({
  receipts,
  open,
  setOpen,
  computedValue = 0,
  setCashValue,
}: {
  receipts: z.infer<typeof createCashReceiptsSchema>
  open: boolean
  setOpen: (open: boolean) => void
  computedValue?: number
  setCashValue?: (v: string) => void
}) {
  const cashTypes = [
    'cash_005',
    'cash_010',
    'cash_025',
    'cash_050',
    'cash_1',
    'cash_2',
    'cash_5',
    'cash_10',
    'cash_20',
    'cash_50',
    'cash_100',
    'cash_200',
  ] as const

  type CashType = (typeof cashTypes)[number]

  const defaultValues = cashTypes.reduce(
    (acc, type) => {
      const match = receipts.find((r) => r.type === type)
      acc[type] = match ? match.amount : 0
      return acc
    },
    {} as Record<CashType, number>,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Calcula o valor total das cédulas e moedas inseridas
  const formValues = form.watch()
  const totalCashAmount = Object.keys(formValues).reduce((acc, key) => {
    const typedKey = key as keyof typeof MONEY_VALUES
    const value = Number(MONEY_VALUES[typedKey] || 0)
    const amount = Number(formValues[key as keyof typeof formValues] ?? 0) || 0
    return acc + value * amount
  }, 0)

  // Diferença entre o valor computado e o total das cédulas/moedas
  const difference = totalCashAmount - computedValue

  const { execute: createReceipts, isPending: isCreating } = useServerAction(
    upsertCashReceipts,
    {
      onSuccess: () => {
        setOpen(false)
      },
      onError: ({ err }) => {
        console.log('Erro ao salvar cédulas e moedas: ', err)
      },
    },
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const cashReceipts = (
        Object.keys(values) as (keyof typeof MONEY_VALUES)[]
      ).map((key) => {
        const typedKey = key as keyof typeof MONEY_VALUES
        const value = Number(MONEY_VALUES[typedKey] || 0)
        const amount = Number(values[key] ?? 0) || 0

        return {
          type: key,
          value,
          amount,
          total: Number((value * amount).toFixed(2)),
        }
      })

      createReceipts(cashReceipts)

      // Atualiza o valor total no query param correspondente
      const total = cashReceipts.reduce(
        (acc, receipt) => acc + receipt.total,
        0,
      )
      if (setCashValue) setCashValue(String(total))
    } catch (err) {
      console.error('Erro de validação:', err)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="space-y-4">
        <SheetHeader className="items-start mb-4">
          <div className="flex flex-row items-center gap-2">
            <SheetClose
              className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            >
              <ArrowLeft />
            </SheetClose>
            <SheetTitle className="!mt-0">Cédulas e moedas</SheetTitle>
          </div>
          <SheetDescription className="!mt-0">
            Insira a quantidade de cada moeda ou cédula.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* NOVO BLOCO: Exibir valor computado e diferença */}
            <div className="mb-4">
              <div className="flex flex-row justify-between text-sm">
                <span>Valor computado</span>
                <span>{formatCurrencyBRL(computedValue)}</span>
              </div>
              <div className="flex flex-row justify-between text-sm">
                <span>Cédulas e moedas inseridas</span>
                <span>{formatCurrencyBRL(totalCashAmount)}</span>
              </div>
              <div className="flex flex-row justify-between text-sm">
                <span>Diferença</span>
                <span
                  className={
                    difference === 0 ? 'text-green-600' : 'text-amber-600'
                  }
                >
                  {formatCurrencyBRL(difference)}
                </span>
              </div>
            </div>

            <Card className="p-4">
              <h2>Moedas</h2>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="cash_005"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,05</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_010"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,10</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_025"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,25</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_050"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,50</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 1,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
            <Card className="p-4">
              <h2>Cédulas</h2>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="cash_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 2,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_5"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 5,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_10"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 10,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 20,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_50"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 50,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_100"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 100,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cash_200"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 200,00</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button
              type="button"
              onClick={() => onSubmit(form.getValues())}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar cédulas e moedas</span>
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
