'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Banknote, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
import { convertStringToNumber } from '@/lib/utils'

const paymentOptions = [
  {
    id: 1,
    title: 'Cartão',
    provider: 'stripe',
    icon: CreditCard,
  },
  // {
  //   id: 2,
  //   title: 'PIX',
  //   provider: 'mercadopago',
  //   icon: CreditCard,
  // },
  // {
  //   id: 3,
  //   title: 'Dinheiro',
  //   provider: 'money',
  //   icon: Banknote,
  // },
]

const FormSchema = z.object({
  type: z.enum(['with_change', 'without_change'], {
    required_error: 'You need to select a notification type.',
  }),
  change_value: z.string().optional(),
})

export default function Payment() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedPickup = searchParams.get('pickup')
  const selectedAddress = searchParams.get('address')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { type, change_value: changeValue } = data

    return router.push(
      `?step=summary&pickup=${selectedPickup}${selectedAddress ? `&address=${selectedAddress}` : ''}&payment=money${type === 'with_change' ? `&changeValue=${convertStringToNumber(changeValue as string)}` : ''}`,
    )
  }

  return (
    <section className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-2 w-full">
        {paymentOptions.map((option) => (
          <Link
            href={`?step=summary&pickup=${selectedPickup}${selectedAddress ? `&address=${selectedAddress}` : ''}&payment=${option.provider}`}
            key={option.title}
          >
            <Card className="flex flex-row items-center justify-between p-4 w-full">
              <p className="flex flex-row items-center">
                <option.icon className="w-5 h-5 mr-2" />
                {option.title}
              </p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}

        <Accordion type="single" collapsible>
          <Card className="px-4">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="w-full">
                <p className="flex flex-row items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Dinheiro
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg">
                            Precisa de troco?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <Card className="p-4">
                                <FormItem className="flex flex-col gap-2">
                                  <div className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="with_change" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Sim, preciso de troco
                                    </FormLabel>
                                  </div>

                                  {form.watch('type') === 'with_change' && (
                                    <FormField
                                      control={form.control}
                                      name="change_value"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            Valor a ser pago
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              maskType="currency"
                                              placeholder="Insira o valor que você pagará"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormDescription>
                                            Digite quanto vai pagar em dinheiro
                                            para que o entregador leve o seu
                                            troco.
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </FormItem>
                              </Card>

                              <Card className="p-4">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="without_change" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Sem troco
                                  </FormLabel>
                                </FormItem>
                              </Card>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" variant="outline">
                      Continuar
                    </Button>
                  </form>
                </Form>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </Accordion>
      </div>
    </section>
  )
}
