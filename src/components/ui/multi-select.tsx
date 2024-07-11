'use client'

import { ChevronsUpDown, X } from 'lucide-react'
import * as React from 'react'

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

export type OptionDataType = {
  id: string
  value: string
  label: string
}

type MultiSelectPropsType = {
  options: OptionDataType[]
  value: OptionDataType[]
  setValue: React.Dispatch<React.SetStateAction<OptionDataType[]>>
  placeholder?: string
}

export function MultiSelect({
  options,
  value,
  setValue,
  placeholder,
}: MultiSelectPropsType) {
  const optionsWithoutSelected = options.filter((option) => {
    return !value.some(
      (selectedOption) => selectedOption.value === option.value,
    )
  })

  function handleAddOption(option: OptionDataType) {
    setValue((prevState) => [...prevState, option])
  }

  function handleExcludeOption(optionToExclude: OptionDataType) {
    const newSelectedOptions = value.filter(
      (option) => option.value !== optionToExclude.value,
    )
    setValue(newSelectedOptions)
  }

  return (
    <Popover>
      <div>
        <PopoverTrigger disabled={options.length === 0} className="w-full">
          <div
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full h-fit justify-between hover:bg-secondary/30',
            )}
          >
            {value && value.length > 0 ? (
              <span className="flex flex-row flex-wrap gap-1">
                {value.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-md font-normal p-0 pl-2"
                  >
                    {option.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 w-5 h-5"
                      onClick={() => handleExcludeOption(option)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </span>
            ) : (
              <span className="tracking-tight text-muted-foreground">
                {placeholder || 'Selecione uma ou mais opções...'}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[335px] p-0">
        <Command>
          <CommandInput placeholder="Filtrar opções..." />

          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>

            <CommandGroup>
              {optionsWithoutSelected.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleAddOption(option)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
