'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { parseCookies, setCookie } from 'nookies'
import { useEffect } from 'react'
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
import { PhoneInput } from '@/components/ui/input-phone'
import { createPath } from '@/lib/utils'
import { UserType } from '@/models/user'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { updateAccount } from './actions'

export const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
})

export function AccountForm({
  user,
  storeSubdomain,
}: {
  user: UserType | null
  storeSubdomain?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const checkout = searchParams.get('checkout')

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (!user) {
      const cookies = parseCookies()
      const savedGuest = cookies.guest_data
      if (savedGuest) {
        const guestData = JSON.parse(savedGuest)
        form.reset(guestData)
      }
    } else {
      form.reset({
        name: user.name ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user, form])

  async function onSubmit(values: z.infer<typeof accountSchema>) {
    if (user) {
      const { error } = await updateAccount(values)

      if (error) {
        console.error(error)
        return
      }

      toast('Informações atualizadas com sucesso')
    } else {
      setCookie(null, 'guest_data', JSON.stringify(values), {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      toast('Dados salvos para futuras compras')
    }

    if (checkout) {
      return router.push(
        createPath(`/checkout?step=${checkout}`, storeSubdomain),
      )
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o seu nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button
          type="submit"
          className="ml-auto"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isSubmitted ||
            !form.formState.isValid
          }
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Salvar
        </Button>
      </form>
    </Form>
  )
}
