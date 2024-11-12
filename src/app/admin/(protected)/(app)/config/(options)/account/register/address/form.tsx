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
import { AddressType } from '@/models/user'
import { ViacepType } from '@/models/viacep-address'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createAddress, updateAddress } from './actions'

export const addressSchema = z.object({
  zip_code: z.string().min(8),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  complement: z.string().optional(),
})

export function AddressForm({ address }: { address: AddressType | null }) {
  const router = useRouter()
  const params = useParams()

  const isOnboarding = !!params.current_step

  const [hasAddress, setHasAddress] = useState(!!address)

  const zipCode = address?.zip_code ?? undefined
  const number = address?.number ?? ''
  const complement = address?.complement ?? ''

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zip_code: zipCode,
      number,
      complement,
    },
  })

  function verifyCEP() {
    const cep = form.watch('zip_code')

    fetch(`https://viacep.com.br/ws/${zipCode ?? cep}/json`)
      .then((res) => res.json())
      .then((data: ViacepType) => {
        setHasAddress(true)
        form.setValue('street', data.logradouro)
        form.setValue('neighborhood', data.bairro)
        form.setValue('city', data.localidade)
        form.setValue('state', data.uf)
      })
  }

  async function onSubmit(values: z.infer<typeof addressSchema>) {
    if (address) {
      const { error } = await updateAddress(values)

      if (error) {
        console.error(error)
        return
      }

      toast('Informações atualizadas com sucesso')
    }

    const { error } = await createAddress(values)

    if (error) {
      console.error(error)
      return
    }

    if (isOnboarding) {
      router.push('/admin/onboarding/store/hours')
    } else {
      router.back()
    }
  }

  useEffect(() => {
    if (zipCode) {
      verifyCEP()
    }
  }, [zipCode]) // eslint-disable-line

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
                  maskType="cep"
                  placeholder="Digite o CEP da sua loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex">
                {/* <Link href="?step=search-zc" className={cn('text-primary')}>
                  Não sei o CEP
                </Link> */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
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
            <FormItem hidden={!hasAddress}>
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
            <FormItem hidden={!hasAddress}>
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
            <FormItem hidden={!hasAddress}>
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
            <FormItem hidden={!hasAddress}>
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
            <FormItem hidden={!hasAddress}>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type={hasAddress ? 'submit' : 'button'}
          className="ml-auto"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isSubmitting ||
            (hasAddress && !form.formState.isValid)
          }
          onClick={verifyCEP}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {hasAddress ? 'Salvar' : 'Verificar CEP'}
        </Button>
      </form>
    </Form>
  )
}
