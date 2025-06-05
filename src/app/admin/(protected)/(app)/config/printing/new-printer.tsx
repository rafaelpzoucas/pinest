'use client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { createPrinter, readAvailablePrinters } from './actions'
import { printerSchema } from './schemas'

export function NewPrinter() {
  const [isOpen, setIsOpen] = useState(false)
  const [availablePrinters, setAvailablePrinters] = useState([])

  const form = useForm<z.infer<typeof printerSchema>>({
    resolver: zodResolver(printerSchema),
    defaultValues: {
      name: '',
      nickname: '',
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
        setIsOpen(false)
        toast('Impressora adicionada com sucesso')
      },
    })

  function onSubmit(data: z.infer<typeof printerSchema>) {
    executeCreatePrinter(data)
  }

  useEffect(() => {
    executeReadAvailablePrinters()
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <Plus /> Adicionar impressora
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova impressora</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impressora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
      </SheetContent>
    </Sheet>
  )
}
