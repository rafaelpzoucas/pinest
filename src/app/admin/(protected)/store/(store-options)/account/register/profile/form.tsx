'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfile } from './actions'

export const profileSchema = z.object({
  name: z.string(),
  phone: z.string(),
})

export function ProfileForm() {
  const searchParams = useSearchParams()

  const name = searchParams.get('name') ?? ''
  const phone = searchParams.get('phone') ?? ''

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name,
      phone,
    },
  })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    const { error } = await updateProfile(values)

    if (error) {
      console.error(error)
      return
    }

    toast('Informações atualizadas com sucesso')
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
                <Input
                  type="tel"
                  placeholder="Digite o seu telefone..."
                  {...field}
                />
              </FormControl>
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
