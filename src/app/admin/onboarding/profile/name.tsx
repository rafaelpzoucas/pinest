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
import { createRow } from '@/services/supabase-service'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string(),
})

export function NameStep() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      return router.push('/admin/sign-in')
    }

    const { error } = await createRow({
      route: 'users',
      columns: {
        id: userData.user.id,
        name: values.name,
        email: userData.user.email,
        role: 'admin',
      },
    })

    if (error) {
      toast(supabaseErrors[error.code] ?? 'Erro desconhecido')
      console.log(error)
      return null
    }

    return router.push('?step=profile&info=phone')
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
                <Input placeholder="Digite o nome da sua loja..." {...field} />
              </FormControl>
              <FormDescription>
                É o nome que aparecerá para o seu cliente quando acessar a sua
                loja.
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
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          Continuar
        </Button>
      </form>
    </Form>
  )
}
