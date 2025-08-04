'use client'

import { Button } from '@/components/ui/button'
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
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ExtrasInputProps {
  availableExtras: ExtraType[]
  isLoading?: boolean
  value: {
    name: string
    price: number
    extra_id: string
    quantity: number
  }[]
  onChange: (extras: ExtrasInputProps['value']) => void
  placeholder?: string
}

export function ExtrasInput({
  availableExtras,
  isLoading,
  value,
  onChange,
  placeholder = 'Adicionais',
}: ExtrasInputProps) {
  const [open, setOpen] = useState(false)

  const totalExtrasPrice = value.reduce(
    (total, extra) => total + extra.price,
    0,
  )

  const handleAddExtra = (extra: ExtraType) => {
    const newExtra = {
      name: extra.name,
      price: extra.price,
      extra_id: extra.id,
      quantity: 1,
    }
    onChange([...value, newExtra])
    setOpen(false)
  }
  const handleRemove = (index: number) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={availableExtras.length === 0}
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>{placeholder}</span>
            </div>
            {totalExtrasPrice > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatCurrencyBRL(totalExtrasPrice)}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar adicional..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <Loader2 className="animate-spin" />
                    <span>Carregando adicionais...</span>
                  </div>
                ) : (
                  'Nenhum adicional encontrado.'
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableExtras.map((extra) => (
                  <CommandItem
                    key={extra.id}
                    onSelect={() => handleAddExtra(extra)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{extra.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrencyBRL(extra.price)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badges dos extras selecionados */}
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.length > 0 &&
            value.map((extra, index) => (
              <li
                key={index}
                className="flex items-center gap-3 bg-muted px-2 py-1 rounded-lg text-xs"
              >
                <div>
                  <span>{extra.quantity} ad. </span>
                  <span className="uppercase">{extra.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex flex-row items-center gap-2 ml-auto"
                >
                  <span>{formatCurrencyBRL(extra.price)}</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
