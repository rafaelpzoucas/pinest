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
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { updateStore } from './actions'

export const storeSchema = z.object({
  name: z.string(),
  role: z.string(),
})

export function StoreForm() {
  const searchParams = useSearchParams()

  const id = searchParams.get('id') ?? ''
  const name = searchParams.get('name') ?? ''
  const role = searchParams.get('role') ?? ''

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name,
      role,
    },
  })

  async function onSubmit(values: z.infer<typeof storeSchema>) {
    const { error } = await updateStore(values, id)

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
              <FormLabel>Nome da loja</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome da loja..."
                  className="capitalize"
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
          Salvar
        </Button>
      </form>
    </Form>
  )
}
