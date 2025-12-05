'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useServerAction } from 'zsa-react'
import { upsertPrintingSettings } from './actions'
import { useToast } from '@/components/ui/use-toast'

const FormSchema = z.object({
  auto_print: z.boolean().default(false).optional(),
})

export function AutoPrint({ printSettings }: { printSettings: any }) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      auto_print: printSettings?.auto_print || false,
    },
  })

  const { execute } = useServerAction(upsertPrintingSettings, {
    onSuccess: () => {
      toast({
        title: 'Atualizado com sucesso',
      })
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    execute(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="auto_print"
          render={({ field }) => (
            <Card className="flex flex-row items-center justify-between pr-6">
              <CardHeader>
                <CardTitle>Impressão automática</CardTitle>
                <CardDescription>
                  Mantenha ativado para imprimir automaticamente cada pedido
                  confirmado
                </CardDescription>
              </CardHeader>
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked) // Atualiza o valor no form
                      form.handleSubmit(onSubmit)() // Dispara o onSubmit com os dados atuais
                    }}
                  />
                </FormControl>
              </FormItem>
            </Card>
          )}
        />
      </form>
    </Form>
  )
}
