'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { stringToNumber } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { updateDiscount } from '../[id]/actions'

const FormSchema = z.object({
  discount: z.string(),
})

export function DiscountForm({ purchaseId }: { purchaseId: string }) {
  const searchParams = useSearchParams()

  const defaultDiscount = searchParams.get('discount')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      discount: undefined,
    },
  })

  const formState = form.formState

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const discount = stringToNumber(data.discount) ?? 0

    await updateDiscount(purchaseId, discount)

    toast('Desconto atualizado com sucesso!')
  }

  useEffect(() => {
    if (defaultDiscount) {
      form.setValue('discount', defaultDiscount.toString())
    }
  }, [defaultDiscount])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor do desconto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              <span>Salvando</span>
            </>
          ) : (
            <span>Salvar</span>
          )}
        </Button>
      </form>
    </Form>
  )
}
