'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createCustomerSchema } from '@/app/[public_store]/account/register/schemas'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { StoreCustomerType } from '@/models/store-customer'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useServerAction } from 'zsa-react'
import {
  createCustomer,
  updateCustomer,
} from '../../deliveries/register/customers/actions'

type CustomersFormProps = {
  sheetState: [boolean, Dispatch<SetStateAction<boolean>>]
  selectedCustomer?: StoreCustomerType
}
export function CustomersForm({
  sheetState,
  selectedCustomer,
}: CustomersFormProps) {
  const router = useRouter()

  const [isSheetOpen, setIsSheetOpen] = sheetState

  const form = useForm<z.infer<typeof createCustomerSchema>>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: undefined,
      phone: '+55',
      address: undefined,
    },
  })

  const { execute: executeCreate, isPending: isCreating } = useServerAction(
    createCustomer,
    {
      onSuccess: () => {
        form.reset()
        setIsSheetOpen(false)
      },
    },
  )
  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updateCustomer,
    {
      onSuccess: () => {
        form.reset()
        setIsSheetOpen(false)
      },
    },
  )

  function onSubmit(values: z.infer<typeof createCustomerSchema>) {
    if (selectedCustomer) {
      executeUpdate({ ...values, id: selectedCustomer.id })
    } else {
      executeCreate(values)
    }
  }

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('name', selectedCustomer.customers.name)
      form.setValue('phone', selectedCustomer.customers.phone)
      form.setValue('address.street', selectedCustomer.customers.address.street)
      form.setValue('address.number', selectedCustomer.customers.address.number)
      form.setValue(
        'address.neighborhood',
        selectedCustomer.customers.address.neighborhood,
      )
      form.setValue(
        'address.complement',
        selectedCustomer.customers.address.complement,
      )
      form.setValue(
        'address.observations',
        selectedCustomer.customers.address.observations,
      )
    }
  }, [selectedCustomer])

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

      <SheetContent className="!p-0">
        <SheetHeader className="flex flex-row items-center gap-2 p-4">
          <SheetClose
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <ArrowLeft />
          </SheetClose>
          <SheetTitle className="!mt-0">
            {selectedCustomer ? 'Editando' : 'Novo'} cliente
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[calc(100dvh_-_132px)] px-5">
              <div className="flex flex-col w-full space-y-4 pb-16">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} />
                      </FormControl>
                      <FormDescription>O número de WhatsApp.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o seu nome..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira a sua rua..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira o número..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira o bairro..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Insira o complemento se tiver..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Insira uma observação..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <SheetFooter className="p-4">
              <Button
                type="submit"
                className="ml-auto w-full"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {selectedCustomer ? 'Atualizar' : 'Cadastrar'} cliente
              </Button>
            </SheetFooter>
          </form>
        </Form>

        {selectedCustomer && (
          <section>
            <h1 className="text-lg font-bold">Saldo do cliente</h1>

            <div className="flex flex-row items-center justify-between text-muted-foreground">
              <p>Saldo atual:</p>
              <strong>{formatCurrencyBRL(selectedCustomer.balance)}</strong>
            </div>
          </section>
        )}
      </SheetContent>
    </Sheet>
  )
}
