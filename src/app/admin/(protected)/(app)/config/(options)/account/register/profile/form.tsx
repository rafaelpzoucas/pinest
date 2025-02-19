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
import { UserType } from '@/models/user'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile } from './actions'

export const profileSchema = z.object({
  name: z.string(),
  phone: z.string(),
  cpf_cnpj: z.string(),
})

export function ProfileForm({ user }: { user: UserType | null }) {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      cpf_cnpj: user?.cpf_cnpj ?? '',
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
          name="cpf_cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="Digite o seu CPF ou CNPJ..." {...field} />
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
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Salvar
        </Button>
      </form>
    </Form>
  )
}
