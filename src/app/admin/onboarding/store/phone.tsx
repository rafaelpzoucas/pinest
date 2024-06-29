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
import { PhoneInput } from '@/components/ui/input-phone'
import { createClient } from '@/lib/supabase/client'
import { supabaseErrors } from '@/services/supabase-errors'
import { updateRow } from '@/services/supabase-service'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const formSchema = z.object({
  phone: z.string().min(13),
})

export function PhoneForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const phone = searchParams.get('phone') ?? ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      return router.push('/admin/sign-in')
    }

    const { error } = await updateRow({
      route: 'stores',
      columns: {
        phone: values.phone,
      },
      filter: { key: 'user_id', value: userData.user.id },
    })

    if (error) {
      toast(supabaseErrors[error.code] ?? 'Erro desconhecido')
      console.log(error)
      return null
    }

    return router.push('?step=2&info=role')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-8"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <PhoneInput autoFocus {...field} />
              </FormControl>
              <FormDescription>
                Dê preferência ao número de WhatsApp.
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
