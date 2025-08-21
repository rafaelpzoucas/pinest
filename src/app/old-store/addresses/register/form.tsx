'use client'

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
import { cn, createPath } from '@/lib/utils'
import { AddressType } from '@/models/address'
import { supabaseErrors } from '@/services/supabase-errors'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { parseCookies, setCookie } from 'nookies'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createCustomerAddress, updateCustomerAddress } from './actions'

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

export function AddressForm({
  address,
  user,
  storeSubdomain,
}: {
  address: AddressType | null
  user: any | null
  storeSubdomain?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentAddress, setCurrentAddress] = useState(!!address)

  const zipCode = searchParams.get('zip-code')

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      zip_code: (zipCode || address?.zip_code) ?? '',
      number: address?.number ?? '',
      complement: address?.complement ?? '',
      street: address?.street ?? '',
      neighborhood: address?.neighborhood ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
    },
  })

  function verifyCEP() {
    const cep = form.watch('zip_code')

    fetch(`https://viacep.com.br/ws/${zipCode ?? cep}/json`)
      .then((res) => res.json())
      .then((data: ViacepType) => {
        setCurrentAddress(true)
        form.setValue('street', data.logradouro)
        form.setValue('neighborhood', data.bairro)
        form.setValue('city', data.localidade)
        form.setValue('state', data.uf)
      })
  }

  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    if (user) {
      if (address) {
        await updateCustomerAddress(values, address.id)
      } else {
        const { createAddressError } = await createCustomerAddress(values)
        if (createAddressError) {
          toast(supabaseErrors[createAddressError.code] ?? 'Erro desconhecido')
          console.error(createAddressError)
          return null
        }
      }
    } else {
      const guestInfo = parseCookies().guest_data
      const updatedGuestInfo = {
        ...(guestInfo ? JSON.parse(guestInfo) : {}),
        address: values,
      }
      setCookie(null, 'guest_data', JSON.stringify(updatedGuestInfo), {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      })
    }
    return router.push(createPath('/checkout?step=pickup', storeSubdomain))
  }

  useEffect(() => {
    if (!address) {
      const guestInfo = parseCookies().guest_data

      if (guestInfo) {
        const parsedGuestInfo = JSON.parse(guestInfo)
        if (parsedGuestInfo.address) {
          setCurrentAddress(parsedGuestInfo.address)
          form.setValue('zip_code', parsedGuestInfo.address.zip_code)
          form.setValue('number', parsedGuestInfo.address.number)
          form.setValue('complement', parsedGuestInfo.address.complement)
          form.setValue('street', parsedGuestInfo.address.street)
          form.setValue('neighborhood', parsedGuestInfo.address.neighborhood)
          form.setValue('city', parsedGuestInfo.address.city)
          form.setValue('state', parsedGuestInfo.address.state)
        }
      }
    }
  }, [address])

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
                  placeholder="Digite o seu CEP..."
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex">
                <Link href="search-zipcode" className={cn('text-primary')}>
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
            <FormItem hidden={!currentAddress}>
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
            <FormItem hidden={!currentAddress}>
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
            <FormItem hidden={!currentAddress}>
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
            <FormItem hidden={!currentAddress}>
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
            <FormItem hidden={!currentAddress}>
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
            <FormItem hidden={!currentAddress}>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type={currentAddress ? 'submit' : 'button'}
          className="ml-auto"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isSubmitting ||
            (currentAddress && !form.formState.isValid)
          }
          onClick={verifyCEP}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {currentAddress
            ? address
              ? 'Salvar alterações'
              : 'Continuar'
            : 'Verificar CEP'}
        </Button>
      </form>
    </Form>
  )
}
