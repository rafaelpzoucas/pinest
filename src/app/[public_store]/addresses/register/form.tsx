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
import { cn } from '@/lib/utils'
import { supabaseErrors } from '@/services/supabase-errors'
import { Loader } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { createCustomerAddress } from './actions'

type ViacepType = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export const addressFormSchema = z.object({
  zip_code: z.string().min(8),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  complement: z.string().optional(),
})

export function AddressForm() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [address, setAddress] = useState(false)

  const zipCode = searchParams.get('zip-code')
  const storeName = params.public_store

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
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

  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    const { error } = await createCustomerAddress(values)

    if (error) {
      toast(supabaseErrors[error.code] ?? 'Erro desconhecido')
      console.log(error)
      return null
    }

    return router.push(`/${storeName}/checkout?step=summary`)
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
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          )}
          {address ? 'Continuar' : 'Verificar CEP'}
        </Button>
      </form>
    </Form>
  )
}
