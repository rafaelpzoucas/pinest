'use client'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { createPrinter, readAvailablePrinters } from './actions'
import { printerSchema, PrinterType } from './schemas'

export const printerSectors = [
  { id: 'kitchen', label: 'Cozinha' },
  { id: 'delivery', label: 'Entrega' },
]

export function NewPrinterForm({
  setSheetState,
  printer,
}: {
  setSheetState: Dispatch<SetStateAction<boolean>>
  printer?: PrinterType
}) {
  const [availablePrinters, setAvailablePrinters] = useState([])

  const form = useForm<z.infer<typeof printerSchema>>({
    resolver: zodResolver(printerSchema),
    defaultValues: {
      name: printer?.name ?? '',
      nickname: printer?.nickname ?? '',
      sectors: printer?.sectors ?? [],
    },
  })

  const { execute: executeReadAvailablePrinters, data: availablePrintersData } =
    useServerAction(readAvailablePrinters, {
      onSuccess: () => {
        setAvailablePrinters(availablePrintersData)
      },
    })

  const { execute: executeCreatePrinter, isPending: isCreating } =
    useServerAction(createPrinter, {
      onSuccess: () => {
        setSheetState(false)
        toast('Impressora adicionada com sucesso')
      },
      onError: ({ err }) => {
        toast(err.message || 'Ocorreu um erro ao adicionar a impressora.')
      },
    })

  function onSubmit(data: z.infer<typeof printerSchema>) {
    executeCreatePrinter({ id: printer?.id, ...data })
  }

  useEffect(() => {
    executeReadAvailablePrinters()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impressora</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma impressora" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePrinters?.map((printer) => (
                    <SelectItem key={printer} value={printer}>
                      {printer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da impressora" {...field} />
              </FormControl>
              <FormDescription>
                Insira o nome da impressora, ex: "Cozinha"
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectors"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Setores</FormLabel>
                <FormDescription>
                  Marque os setores de impressão desta impressora
                </FormDescription>
              </div>
              {printerSectors.map((sector) => (
                <FormField
                  key={sector.id}
                  control={form.control}
                  name="sectors"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={sector.id}
                        className="flex flex-row items-center gap-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(sector.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, sector.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== sector.id,
                                    ),
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal !mt-0">
                          {sector.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormDescription>
                Se nada for marcado, a impressora imprimirá tudo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Salvando impressora...</span>
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </form>
    </Form>
  )
}
