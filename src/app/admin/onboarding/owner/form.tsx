'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { supabaseErrors } from '@/services/supabase-errors'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createOwner } from './actions'

export const ownerFormSchema = z.object({
  name: z.string().min(1, {
    message: 'O nome não pode estar vazio.',
  }),
  phone: z.string().min(13, {
    message: 'O telefone não pode estar vazio.',
  }),
})

export function OwnerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const name = searchParams.get('name') ?? ''

  const form = useForm<z.infer<typeof ownerFormSchema>>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
      name,
    },
  })

  async function onSubmit(values: z.infer<typeof ownerFormSchema>) {
    const { ownerError } = await createOwner(values)

    if (ownerError) {
      toast(supabaseErrors[ownerError.code] ?? 'Erro desconhecido')
      console.error(ownerError)
      return null
    }

    return router.push('?step=2')
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
              <FormLabel>Nome do proprietário</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Digite o nome do proprietário..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Digite o seu nome, ou do responsável pela loja.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do proprietário</FormLabel>
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
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando informações
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </form>
    </Form>
  )
}
