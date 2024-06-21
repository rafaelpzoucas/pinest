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
import { cn } from '@/lib/utils'
import { ViacepType } from '@/models/viacep-address'
import { supabaseErrors } from '@/services/supabase-errors'
import { createRow } from '@/services/supabase-service'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const formSchema = z.object({
  zip_code: z.string().min(8),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  complement: z.string().optional(),
})

export function AddressStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [address, setAddress] = useState(false)

  const zipCode = searchParams.get('zip-code')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zip_code: zipCode ?? '',
    },
  })

  function verifyCEP() {
    const cep = form.watch('zip_code')

    fetch(`https://viacep.com.br/ws/${zipCode ?? cep}/json`)
      .then((res) => res.json())
      .then((data: ViacepType) => {
        setAddress(true)
        form.setValue('street', data.logradouro)
        form.setValue('neighborhood', data.bairro)
        form.setValue('city', data.localidade)
        form.setValue('state', data.uf)
      })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()

    const { data: session, error: userError } = await supabase.auth.getUser()

    if (userError || !session?.user) {
      return router.push('/admin/sign-in')
    }

    const { error } = await createRow({
      route: 'addresses',
      columns: {
        user_id: session.user.id,
        zip_code: values.zip_code,
        street: values.street,
        number: values.number,
        neighborhood: values.neighborhood,
        state: values.state,
        city: values.city,
        complement: values.complement,
      },
    })

    if (error) {
      toast(supabaseErrors[error.code] ?? 'Erro desconhecido')
      console.log(error)
      return null
    }

    return router.push('?step=store&info=name')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6 pb-6"
      >
        <FormField
          control={form.control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  type="zip-code"
                  placeholder="Digite o CEP da sua loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex">
                <Link href="?step=search-zc" className={cn('text-primary')}>
                  Não sei o CEP
                </Link>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="Digite o número..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="complement"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Complemento (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Digite o complemento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Rua</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem hidden={!address}>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type={address ? 'submit' : 'button'}
          className="ml-auto"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isSubmitting ||
            (address && !form.formState.isValid)
          }
          onClick={verifyCEP}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {address ? 'Continuar' : 'Verificar CEP'}
        </Button>
      </form>
    </Form>
  )
}
