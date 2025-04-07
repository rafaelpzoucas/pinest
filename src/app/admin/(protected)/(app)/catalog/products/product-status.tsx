'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useServerAction } from 'zsa-react'
import { updateProductStatus } from './actions'
import { updateProductStatusSchema } from './schemas'

export function ProductStatus({
  productId,
  defaultStatus,
}: {
  defaultStatus: string
  productId: string
}) {
  const { toast } = useToast()

  const isStatusActive = defaultStatus === 'active'

  const form = useForm<z.infer<typeof updateProductStatusSchema>>({
    resolver: zodResolver(updateProductStatusSchema),
    defaultValues: {
      status: isStatusActive,
    },
  })

  const { execute, isPending } = useServerAction(updateProductStatus, {
    onSuccess: () => {
      toast({
        title: 'Produto atualizado com sucesso.',
      })
    },
  })

  function onSubmit(data: z.infer<typeof updateProductStatusSchema>) {
    execute({ ...data, product_id: productId })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="ml-2 h-[20px]">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    onSubmit({ product_id: productId, status: checked })
                  }}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
