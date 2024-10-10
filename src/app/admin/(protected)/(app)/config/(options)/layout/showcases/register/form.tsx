'use client'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShowcaseType } from '@/models/showcase'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createShowcase, updateShowcase } from './actions'

export const showcaseFormSchema = z.object({
  name: z.string({ required_error: 'Por favor, insira o nome.' }),
  description: z.string().optional(),
  order_by: z.string(),
})

export function ShowcaseForm({ showcase }: { showcase: ShowcaseType | null }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof showcaseFormSchema>>({
    resolver: zodResolver(showcaseFormSchema),
    defaultValues: {
      name: showcase?.name ?? '',
      description: showcase?.description ?? '',
      order_by: showcase?.order_by ?? '',
    },
  })

  async function onSubmit(values: z.infer<typeof showcaseFormSchema>) {
    if (showcase) {
      const { updateShowcaseError } = await updateShowcase(showcase?.id, values)
      if (updateShowcaseError) {
        throw new Error(updateShowcaseError)
      }
    } else {
      const { insertShowcaseError } = await createShowcase(values)
      if (insertShowcaseError) {
        throw new Error(insertShowcaseError)
      }
    }

    router.back()
  }

  const ORDER_BY_OPTIONS = [
    {
      label: 'Data de cadastro',
      value: 'created_at',
    },
    {
      label: 'Nome do produto',
      value: 'name',
    },
    {
      label: 'Preço',
      value: 'price',
    },
    {
      label: 'Preço promocional',
      value: 'promotional_price',
    },
    {
      label: 'Quantidade em estoque',
      value: 'stock',
    },
    {
      label: 'Quantidade de vendidos',
      value: 'amount_sold',
    },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Insira o título..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Insira a descrição..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordenar por</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ORDER_BY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />{' '}
              {showcase ? 'Atualizando' : 'Criando'}
            </>
          ) : showcase ? (
            'Atualizar'
          ) : (
            'Criar'
          )}{' '}
          vitrine
        </Button>
      </form>
    </Form>
  )
}
