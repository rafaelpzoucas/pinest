'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
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
import { PhoneInput } from '@/components/ui/input-phone'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { CustomerType } from '@/models/customer'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { useServerAction } from 'zsa-react'
import { createCustomer } from './actions'
import { createCustomerFormSchema } from './schemas'

type CustomersFormProps = {
  sheetState: [boolean, Dispatch<SetStateAction<boolean>>]
}
export function CustomersForm({ sheetState }: CustomersFormProps) {
  const router = useRouter()

  const [isSheetOpen, setIsSheetOpen] = sheetState

  const form = useForm<z.infer<typeof createCustomerFormSchema>>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: {
      name: undefined,
      phone: '+55',
      address: undefined,
    },
  })

  const { execute, isPending, data } = useServerAction(createCustomer, {
    onError: (err: any) => {
      console.error('Error creating customer:', err)
    },
    onSuccess: () => {
      console.log(data?.createdCustomer)
      const customer = data?.createdCustomer[0] as unknown as CustomerType

      router.push(`?created_customer=${customer?.id}`)
      form.reset()
      setIsSheetOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof createCustomerFormSchema>) {
    execute(values)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: 'secondary' }),
          'w-full max-w-sm',
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Cliente
      </SheetTrigger>

      <SheetContent className="space-y-6">
        <SheetHeader>
          <SheetTitle>Novo cliente</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o nome do cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (WhatsApp)</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="Insira o WhatsApp do cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o endereço do cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: Rua Exemplo, 123 - Centro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cadastrar cliente
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
