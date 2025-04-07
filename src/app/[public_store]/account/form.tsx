'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { PhoneInput } from '@/components/ui/input-phone'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { readCustomer } from './actions'
import { readAccountSchema } from './schemas'

export function ReadCustomerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const qCheckout = searchParams.get('checkout')

  const form = useForm<z.infer<typeof readAccountSchema>>({
    resolver: zodResolver(readAccountSchema),
    defaultValues: {
      phone: '',
    },
  })

  const { execute, isPending } = useServerAction(readCustomer, {
    onSuccess: () => {
      if (qCheckout) {
        router.push(`account/register?checkout=${qCheckout}`)
      } else {
        router.push(`account/register`)
      }
    },
  })

  async function onSubmit(values: z.infer<typeof readAccountSchema>) {
    execute(values)
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-md mx-auto space-y-6"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormDescription>O número de WhatsApp.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="ml-auto" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Próximo
        </Button>
      </form>
    </Form>
  )
}
