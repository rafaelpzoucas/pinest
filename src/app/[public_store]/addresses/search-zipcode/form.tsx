'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ViacepType } from '@/models/viacep-address'
import { ArrowLeft, ChevronRight, Loader } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const formSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().max(2, {
    message: 'Insira apenas duas letras. Ex: SP',
  }),
})

export function SearchZipCodeForm() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<ViacepType[] | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const streetRegex = values.street.replace(/[^a-zA-Z ]/g, '')

    fetch(
      `https://viacep.com.br/ws/${values.state}/${values.city}/${streetRegex}/json`,
    )
      .then((res) => res.json())
      .then((data: ViacepType[]) => {
        setAddresses(data)
      })
  }

  return (
    <>
      {addresses && addresses.length > 0 ? (
        <section className="flex flex-col gap-4">
          <header>
            <Button
              onClick={() => setAddresses(null)}
              variant={'ghost'}
              size={'icon'}
            >
              <ArrowLeft />
            </Button>
          </header>

          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <Link href={`register?zip-code=${address.cep}`} key={address.cep}>
                <Card className="relative p-4">
                  <span>{address.cep}</span>
                  <p className="text-muted-foreground text-sm">{`${address.logradouro} - ${address.bairro} - ${address.localidade}/${address.uf}`}</p>
                  <ChevronRight className="w-4 h-4 absolute top-3 right-2" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o estado..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira a cidade..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o nome da rua..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="ml-auto"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              Continuar
            </Button>
          </form>
        </Form>
      )}
    </>
  )
}
