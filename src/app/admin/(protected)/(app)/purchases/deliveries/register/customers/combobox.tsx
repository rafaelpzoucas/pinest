'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { StoreCustomerType } from '@/models/store-customer'
import { ChevronsUpDown, Edit2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { createPurchaseFormSchema } from '../schemas'
import { CustomersForm } from './form'

type CustomersComboboxProps = {
  storeCustomers?: StoreCustomerType[]
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
  customerFormSheetState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export function CustomersCombobox({
  storeCustomers,
  form,
  customerFormSheetState,
}: CustomersComboboxProps) {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchase_id')

  const [sheetState, setSheetState] = customerFormSheetState
  const [selectedCustomer, setSelectedCustomer] = useState<
    StoreCustomerType | undefined
  >()

  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <Popover defaultOpen={!purchaseId}>
            <PopoverTrigger asChild>
              <FormControl>
                <div
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between h-fit cursor-pointer',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ? (
                    <div>
                      {
                        storeCustomers?.find(
                          (storeCustomer) => storeCustomer.id === field.value,
                        )?.customers.name
                      }
                      <p className="text-muted-foreground">
                        {
                          storeCustomers?.find(
                            (storeCustomer) => storeCustomer.id === field.value,
                          )?.customers.phone
                        }
                      </p>
                      <p className="text-muted-foreground">
                        {formatAddress(
                          storeCustomers?.find(
                            (storeCustomer) => storeCustomer.id === field.value,
                          )?.customers.address,
                        )}
                      </p>
                    </div>
                  ) : (
                    'Selecione um cliente'
                  )}
                  <ChevronsUpDown className="w-4 h-4 opacity-50" />
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full max-w-md p-0">
              <Command>
                <CommandInput
                  placeholder="Pesquisar cliente..."
                  className="h-9"
                />

                <div className="p-2 w-full">
                  <CustomersForm
                    sheetState={customerFormSheetState}
                    selectedCustomer={selectedCustomer}
                  />
                </div>

                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {storeCustomers?.map((storeCustomer) => (
                      <CommandItem
                        value={`${storeCustomer.customers.name} ${storeCustomer.customers.phone} ${storeCustomer.customers.address.street}`}
                        key={storeCustomer.id}
                        onSelect={() => {
                          form.setValue('customer_id', storeCustomer.id)
                          form.setValue(
                            'delivery.address.street',
                            storeCustomer.customers.address.street,
                          )
                          form.setValue(
                            'delivery.address.number',
                            storeCustomer.customers.address.number,
                          )
                          form.setValue(
                            'delivery.address.neighborhood',
                            storeCustomer.customers.address.neighborhood,
                          )
                          form.setValue(
                            'delivery.address.complement',
                            storeCustomer.customers.address.complement,
                          )
                          form.setValue(
                            'delivery.address.observations',
                            storeCustomer.customers.address.observations,
                          )
                        }}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex flex-row items-start">
                            <span className="max-w-[335px] line-clamp-1">
                              {storeCustomer.customers.name}
                            </span>
                            <div className="ml-auto flex flex-row gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7"
                                onClick={() => {
                                  setSheetState(true)
                                  setSelectedCustomer(storeCustomer)
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {storeCustomer.customers.phone}
                          </p>
                          <p className="text-muted-foreground">
                            {formatAddress(storeCustomer.customers.address)}
                          </p>
                          {storeCustomer.balance < 0 && (
                            <p className="text-muted-foreground">
                              Saldo: {formatCurrencyBRL(storeCustomer.balance)}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
