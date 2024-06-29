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
import { createClient } from '@/lib/supabase/client'
import { supabaseErrors } from '@/services/supabase-errors'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateStore } from './actions'

const formSchema = z.object({
  description: z.string(),
})

export function DescriptionForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      return router.push('/admin/sign-in')
    }

    const { storeError } = await updateStore({
      description: values.description,
    })

    if (storeError) {
      toast(supabaseErrors[storeError.code] ?? 'Erro desconhecido')
      console.log(storeError)
      return null
    }

    return router.push('?step=2&info=phone')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da loja</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Insira uma descriçãopara a loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription>Você poderá alterar depois</FormDescription>
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
