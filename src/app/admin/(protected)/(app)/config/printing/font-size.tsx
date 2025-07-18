'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { useToast } from '@/components/ui/use-toast'
import { useServerAction } from 'zsa-react'
import { upsertPrintingSettings } from './actions'

const FormSchema = z.object({
  kitchen_font_size: z.coerce.number().min(1).max(4),
  font_size: z.coerce.number().min(1).max(4),
})

export function FontSizeSelector({ printSettings }: { printSettings: any }) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      kitchen_font_size: printSettings?.font_size ?? 2,
      font_size: printSettings?.font_size ?? 1,
    },
  })

  const { execute } = useServerAction(upsertPrintingSettings, {
    onSuccess: () => {
      toast({ title: 'Tamanho da fonte atualizado com sucesso' })
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
          name="kitchen_font_size"
          render={({ field }) => (
            <Card>
              <CardHeader>
                <CardTitle>Tamanho da fonte (cozinha)</CardTitle>
                <CardDescription>
                  Selecione o tamanho da fonte para a impressão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      defaultValue={String(field.value)}
                      onValueChange={(val) => {
                        field.onChange(Number(val))
                        form.handleSubmit(onSubmit)()
                      }}
                      className="flex flex-row items-center gap-8"
                    >
                      {[1, 2, 3, 4].map((label, idx) => (
                        <FormItem
                          key={idx}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={String(label)} />
                          </FormControl>
                          <FormLabel className="font-normal">{label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              </CardContent>
            </Card>
          )}
        />

        <FormField
          control={form.control}
          name="font_size"
          render={({ field }) => (
            <Card>
              <CardHeader>
                <CardTitle>Tamanho da fonte (delivery)</CardTitle>
                <CardDescription>
                  Selecione o tamanho da fonte para a impressão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      defaultValue={String(field.value)}
                      onValueChange={(val) => {
                        field.onChange(Number(val))
                        form.handleSubmit(onSubmit)()
                      }}
                      className="flex flex-row items-center gap-8"
                    >
                      {[1, 2, 3, 4].map((label, idx) => (
                        <FormItem
                          key={idx}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={String(label)} />
                          </FormControl>
                          <FormLabel className="font-normal">{label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              </CardContent>
            </Card>
          )}
        />
      </form>
    </Form>
  )
}
