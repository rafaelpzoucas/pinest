'use client'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader2, Plus, Trash } from 'lucide-react'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrencyBRL } from '@/lib/utils'
import { useState } from 'react'
import { useServerAction } from 'zsa-react'
import { upsertCashReceipts } from './actions'
import { createCashReceiptsSchema } from './schemas'

const formSchema = z.object({
  transactions: z.array(z.number()),
})

export function CreditForm({
  receipts,
}: {
  receipts: z.infer<typeof createCashReceiptsSchema>
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const defaultValues = {
    transactions: receipts.map((receipt) => receipt.value) || [],
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { execute: createReceipts, isPending: isCreating } = useServerAction(
    upsertCashReceipts,
    {
      onSuccess: () => {
        setIsSheetOpen(false)
      },
    },
  )

  const [inputValue, setInputValue] = useState('') // <- novo estado para o valor atual
  const transactions = form.watch('transactions')

  const addTransaction = () => {
    const parsedValue = parseFloat(inputValue)
    if (!isNaN(parsedValue) && parsedValue > 0) {
      form.setValue('transactions', [
        ...form.getValues('transactions'),
        parsedValue,
      ])
      setInputValue('') // Limpa o input depois de adicionar
    }
  }

  const removeTransaction = (index: number) => {
    const updated = [...form.getValues('transactions')]
    updated.splice(index, 1)
    form.setValue('transactions', updated)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const cashReceipts = values.transactions.map((transaction) => ({
      type: 'credit',
      value: transaction,
      amount: 1,
      total: transaction,
    })) as z.infer<typeof createCashReceiptsSchema>

    createReceipts(cashReceipts)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger
        className={buttonVariants({ variant: 'secondary', size: 'icon' })}
      >
        <Plus />
      </SheetTrigger>
      <SheetContent className="space-y-4 px-0">
        <ScrollArea className="relative h-[calc(100vh_-_48px)] pb-28 px-5">
          <SheetHeader>
            <SheetTitle>Cartão de crédito</SheetTitle>
            <SheetDescription>
              Insira cada transação de Cartão de crédito
            </SheetDescription>
          </SheetHeader>

          {transactions.length > 0 && (
            <div className="space-y-2">
              {transactions.map((transaction, index) => (
                <Card
                  key={index}
                  className="flex items-center justify-between p-2"
                >
                  <span>{formatCurrencyBRL(transaction)}</span>

                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => removeTransaction(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <footer className="absolute bottom-0 right-0 w-full bg-background px-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o valor da transação..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTransaction()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

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
                    <span>Salvar cartão de crédito</span>
                  )}
                </Button>
              </form>
            </Form>
          </footer>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
