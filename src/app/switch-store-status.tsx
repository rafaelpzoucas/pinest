'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateStoreStatus } from './admin/(protected)/(app)/actions'

const FormSchema = z.object({
  is_open: z.boolean(),
})

export function SwitchStoreStatus({
  isOpen,
  storeId,
}: {
  isOpen: boolean
  storeId: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      is_open: isOpen,
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateStoreStatus(data.is_open)
  }

  const isSwitchOpen = form.watch('is_open')

  useEffect(() => {
    const channel = supabase
      .channel(`store-status-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
          filter: `id=eq.${storeId}`,
        },
        () => {
          form.setValue('is_open', isOpen)
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="is_open"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <div className="space-y-0.5">
                <FormLabel>
                  {isSwitchOpen ? 'Loja aberta' : 'Loja fechada'}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => {
                    field.onChange(value)
                    form.handleSubmit(onSubmit)()
                  }}
                  className="data-[state=unchecked]:bg-destructive data-[state=checked]:bg-emerald-600"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
