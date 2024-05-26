'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { FormControl } from './form'

type OptionType = {
  label: string
  value: string
}

type ComboboxProps = {
  form: any
  field: any
  options: OptionType[] | []
  empty?: ReactNode
}

export function Combobox({ form, field, options, empty }: ComboboxProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'justify-between',
              !field.value && 'text-muted-foreground',
            )}
          >
            {field.value
              ? options.find((option) => option.value === field.value)?.label
              : 'Selecione uma opção...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>{empty}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                value={option.label}
                key={option.value}
                onSelect={() => {
                  form.setValue(field.name, option.value)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    option.value === field.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
