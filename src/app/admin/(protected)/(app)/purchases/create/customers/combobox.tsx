'use client'

import { buttonVariants } from '@/components/ui/button'
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CustomerType } from '@/models/customer'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { createPurchaseFormSchema } from '../schemas'
import { CustomersForm } from './form'

type CustomersComboboxProps = {
  customers: CustomerType[]
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
  customerFormSheetState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export function CustomersCombobox({
  customers,
  form,
  customerFormSheetState,
}: CustomersComboboxProps) {
  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Cliente</FormLabel>
          <Popover>
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
                        customers.find(
                          (customer) => customer.id === field.value,
                        )?.name
                      }
                      <p className="text-muted-foreground">
                        {
                          customers.find(
                            (customer) => customer.id === field.value,
                          )?.phone
                        }
                      </p>
                      <p className="text-muted-foreground">
                        {
                          customers.find(
                            (customer) => customer.id === field.value,
                          )?.address
                        }
                      </p>
                    </div>
                  ) : (
                    'Selecione um cliente'
                  )}
                  <ChevronsUpDown className="w-4 h-4 opacity-50" />
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[335px] p-0">
              <Command>
                <CommandInput
                  placeholder="Pesquisar cliente..."
                  className="h-9"
                />

                <div className="p-2 w-full">
                  <CustomersForm sheetState={customerFormSheetState} />
                </div>

                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        value={customer.name}
                        key={customer.id}
                        onSelect={() => {
                          form.setValue('customer_id', customer.id)
                        }}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex flex-row items-start">
                            <span className="max-w-[225px] line-clamp-1">
                              {customer.name}
                            </span>
                            <Check
                              className={cn(
                                'ml-auto w-4 h-4',
                                customer.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </div>
                          <p className="text-muted-foreground">
                            {customer.phone}
                          </p>
                          <p className="text-muted-foreground">
                            {customer.address}
                          </p>
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
