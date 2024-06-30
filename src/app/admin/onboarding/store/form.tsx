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
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createStore } from './actions'

export const storeFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome da loja é obrigatório.' }),
  description: z.string().optional(),
  phone: z.string().min(13, { message: 'O telefone é obritatório.' }),
  role: z.string().min(3, { message: 'O nicho é obrigatório.' }),
})

export function StoreForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof storeFormSchema>) {
    const { storeError } = await createStore(values)

    if (storeError) {
      console.log(storeError)
    }

    return router.push('?step=2&info=address')
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
              <FormLabel>Nome da loja</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Digite o nome da loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                É o nome que aparecerá para seus clientes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da loja</FormLabel>
              <FormControl>
                <Input
                  placeholder="Insira uma descrição para a loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription>Você poderá alterar depois</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone da loja</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormDescription>O número de WhatsApp da loja.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nicho</FormLabel>
              <FormControl>
                <Input placeholder="Insira o seu nicho..." {...field} />
              </FormControl>
              <FormDescription>
                Qual o tipo de produtos que você vende?
              </FormDescription>
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
          Continuar
        </Button>
      </form>
    </Form>
  )
}
