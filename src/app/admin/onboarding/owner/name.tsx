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
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { createSeller } from './actions'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'O nome não pode estar vazio.',
  }),
})

export function NameStep() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nameInputRef = useRef<HTMLInputElement>(null)

  const name = searchParams.get('name') ?? ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
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

    const response = await createSeller(userData.user.id, userData.user.email)

    if (response) {
      console.log('Seller account created successfully')
    } else {
      console.error('Error creating seller account')
    }

    return router.push('?step=1&info=phone')
  }

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

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
                <Input
                  autoFocus
                  placeholder="Digite o seu nome..."
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
