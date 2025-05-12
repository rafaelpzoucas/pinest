'use client'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Plus } from 'lucide-react'

import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  coins: z.object({
    '5': z.number(),
    '10': z.number(),
    '25': z.number(),
    '50': z.number(),
    '100': z.number(),
  }),
  cedules: z.object({
    '2': z.number(),
    '5': z.number(),
    '10': z.number(),
    '20': z.number(),
    '50': z.number(),
    '100': z.number(),
    '200': z.number(),
  }),
})

export function CashForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coins: {
        '5': undefined,
        '10': undefined,
        '25': undefined,
        '50': undefined,
        '100': undefined,
      },
      cedules: {
        '2': undefined,
        '5': undefined,
        '10': undefined,
        '20': undefined,
        '50': undefined,
        '100': undefined,
        '200': undefined,
      },
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // salvar notas e moedas no banco
    // fechar ao sucesso
    console.log(values)
  }
  return (
    <Sheet>
      <SheetTrigger
        className={buttonVariants({ variant: 'secondary', size: 'icon' })}
      >
        <Plus />
      </SheetTrigger>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Cédulas e moedas</SheetTitle>
          <SheetDescription>
            Insira a quantidade de cada moeda ou cédula.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card className="p-4">
              <h2>Moedas</h2>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="coins.5"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,05</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coins.10"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,10</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coins.25"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,25</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coins.50"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 0,50</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coins.100"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 1,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
            <Card className="p-4">
              <h2>Cédulas</h2>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="cedules.2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 2,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.5"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 5,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.10"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 10,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 20,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.50"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 50,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.100"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 100,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cedules.200"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R$ 200,00</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button type="submit">Salvar cédulas e moedas</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
