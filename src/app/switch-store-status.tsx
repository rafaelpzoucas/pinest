'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { updateStoreStatus } from './admin/(protected)/(app)/actions'

const FormSchema = z.object({
  is_open: z.boolean(),
})

export function SwitchStoreStatus({ isOpen }: { isOpen: boolean }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      is_open: isOpen,
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateStoreStatus(data.is_open)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="is_open"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <div className="space-y-0.5">
                <FormLabel>{isOpen ? 'Loja aberta' : 'Loja fechada'}</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => {
                    field.onChange(value) // Atualiza o estado do formulário
                    form.handleSubmit(onSubmit)() // Executa o submit automaticamente
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
