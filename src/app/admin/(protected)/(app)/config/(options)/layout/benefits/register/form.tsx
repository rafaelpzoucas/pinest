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
import { BenefitType } from '@/models/benefits'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBenefit, updateBenefit } from './actions'

export const benefitFormSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(50),
})

export function BenefitForm({ benefit }: { benefit: BenefitType | null }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof benefitFormSchema>>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      name: benefit?.name ?? '',
      description: benefit?.description ?? '',
    },
  })

  async function onSubmit(values: z.infer<typeof benefitFormSchema>) {
    if (benefit) {
      const { updateBenefitsError } = await updateBenefit(benefit?.id, values)
      if (updateBenefitsError) {
        throw new Error(updateBenefitsError)
      }
    } else {
      const { insertBenefitsError } = await createBenefit(values)
      if (insertBenefitsError) {
        throw new Error(insertBenefitsError)
      }
    }

    router.back()
  }

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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Insira a descrição..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />{' '}
              {benefit ? 'Atualizando' : 'Criando'}
            </>
          ) : benefit ? (
            'Atualizar'
          ) : (
            'Criar'
          )}{' '}
          benefício
        </Button>
      </form>
    </Form>
  )
}
