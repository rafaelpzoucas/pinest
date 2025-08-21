'use client'

import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, CreditCard } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useForm } from 'react-hook-form'
import { FaPix } from 'react-icons/fa6'
import { z } from 'zod'
import { useCheckoutFlow } from './hooks'

const paymentSchema = z
  .object({
    method: z.enum(['CREDIT', 'DEBIT', 'PIX', 'CASH'], {
      required_error: 'Selecione uma forma de pagamento.',
    }),
    cashType: z.enum(['with_change', 'without_change']).optional(),
    changeValue: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'CASH' && data.cashType === 'with_change') {
        return data.changeValue && data.changeValue.length > 0
      }
      return true
    },
    {
      message: 'Valor do troco é obrigatório',
      path: ['changeValue'],
    },
  )

type PaymentFormData = z.infer<typeof paymentSchema>

const paymentOptions = [
  {
    value: 'CREDIT',
    label: 'Cartão de crédito',
    icon: CreditCard,
    description: 'Pagamento com cartão de crédito',
  },
  {
    value: 'DEBIT',
    label: 'Cartão de débito',
    icon: CreditCard,
    description: 'Pagamento com cartão de débito',
  },
  {
    value: 'PIX',
    label: 'PIX',
    icon: FaPix,
    description: 'Pagamento via chave PIX da loja',
  },
]

export function PaymentStep() {
  const { nextStep } = useCheckoutFlow()

  // Query states
  const [payment, setPayment] = useQueryState(
    'payment',
    parseAsString.withDefault(''),
  )
  const [cashType, setCashType] = useQueryState(
    'cashType',
    parseAsString.withDefault(''),
  )
  const [changeValue, setChangeValue] = useQueryState(
    'changeValue',
    parseAsString.withDefault(''),
  )

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: (payment as 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH') || 'CREDIT',
      cashType: (cashType as 'with_change' | 'without_change') || undefined,
      changeValue: changeValue || '',
    },
  })

  const selectedMethod = form.watch('method')
  const selectedCashType = form.watch('cashType')

  const onSubmit = async (data: PaymentFormData) => {
    // Atualiza query params
    await setPayment(data.method)

    if (data.method === 'CASH') {
      await setCashType(data.cashType || '')
      if (data.cashType === 'with_change' && data.changeValue) {
        await setChangeValue(data.changeValue)
      } else {
        await setChangeValue('')
      }
    } else {
      await setCashType('')
      await setChangeValue('')
    }

    nextStep()
  }

  const handlePaymentOptionSelect = async (method: string) => {
    if (method !== 'CASH') {
      form.setValue('method', method as 'CREDIT' | 'DEBIT' | 'PIX')
      await setPayment(method)
      await setCashType('')
      await setChangeValue('')
      nextStep()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Como você quer pagar?</h2>
        <p className="text-muted-foreground text-sm">
          Escolha sua forma de pagamento
        </p>
      </div>

      <div className="space-y-4">
        {/* Opções de pagamento rápidas */}
        {paymentOptions.map((option) => (
          <Card
            key={option.value}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handlePaymentOptionSelect(option.value)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <option.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Pagamento em dinheiro - com form */}
        <Card className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => form.setValue('method', 'CASH')}
              >
                <Banknote className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Dinheiro</p>
                  <p className="text-sm text-muted-foreground">
                    Pagamento em espécie
                  </p>
                </div>
              </div>

              {selectedMethod === 'CASH' && (
                <div className="mt-4 space-y-4 pl-8">
                  <FormField
                    control={form.control}
                    name="cashType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precisa de troco?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-3"
                          >
                            <Card className="p-3">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="with_change" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Sim, preciso de troco
                                </FormLabel>
                              </FormItem>
                            </Card>

                            <Card className="p-3">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="without_change" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Não preciso de troco
                                </FormLabel>
                              </FormItem>
                            </Card>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCashType === 'with_change' && (
                    <FormField
                      control={form.control}
                      name="changeValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Troco para quanto?</FormLabel>
                          <FormControl>
                            <Input
                              maskType="currency"
                              placeholder="Insira o valor..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Informe o valor que você vai pagar para calcularmos
                            o troco
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full">
                    Continuar para resumo
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
